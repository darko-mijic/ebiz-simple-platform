import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../common/logger/logger.service';

// Define a proper typing for Google profile without extending Profile
export interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  provider?: string;
  _raw?: string;
  _json?: any;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      state: true, // Enable CSRF protection
    });
    
    this.logger.log('Google OAuth strategy initialized');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.debug(
        `Google OAuth validation attempt for profile ID: ${profile.id}`,
        {
          module: 'auth',
          provider: 'google',
          profileId: profile.id,
        },
      );
      
      // Extract email from profile
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        this.logger.warn(
          'Google OAuth validation failed: No email found in profile',
          {
            module: 'auth',
            provider: 'google',
            profileId: profile.id,
          },
        );
        
        return done(
          new Error('No email found in Google profile'),
          undefined,
        );
      }
      
      // Create a correlationId for tracking this authentication process
      const correlationId = `google-auth-${profile.id}-${Date.now()}`;
      
      // Convert passport profile to our internal GoogleProfile format
      const googleProfile: GoogleProfile = {
        id: profile.id,
        displayName: profile.displayName,
        name: {
          familyName: profile.name?.familyName || '',
          givenName: profile.name?.givenName || '',
        },
        emails: profile.emails || [],
        photos: profile.photos,
        provider: profile.provider,
        _raw: profile._raw,
        _json: profile._json
      };
      
      // Validate the user with our AuthService
      const user = await this.authService.validateOAuthLogin(googleProfile, correlationId);
      
      // Return user object for Passport
      this.logger.logAuth('Google OAuth validation successful', user.id, {
        provider: 'google',
        profileId: profile.id,
        email,
        correlationId,
      });
      
      return done(null, user);
    } catch (error: unknown) {
      // Extract email safely
      const email = profile.emails?.[0]?.value;
      
      this.logger.logAuthError('Google OAuth validation failed', error, undefined, {
        provider: 'google',
        profileId: profile?.id,
        email,
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined,
      });
      
      return done(error as Error, undefined);
    }
  }
} 