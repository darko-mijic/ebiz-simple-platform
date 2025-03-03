import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../common/logger/logger.service';

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
    });
    
    this.logger.log('Google OAuth strategy initialized', 'GoogleStrategy', {
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.logAuth('Google OAuth validation started', undefined, { 
        profileId: profile.id,
        email: profile.emails?.[0]?.value,
      });
      
      // Validate the user with our AuthService
      const user = await this.authService.validateOAuthLogin(profile);
      
      // Return user object for Passport
      this.logger.logAuth('Google OAuth validation successful', user.id);
      done(null, user);
    } catch (error) {
      this.logger.logAuthError('Google OAuth validation failed', error, undefined, {
        profileId: profile.id,
        email: profile.emails?.[0]?.value,
      });
      done(error, false);
    }
  }
} 