import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { OAuthConfigService } from '../oauth-config.service';

interface User {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private oauthConfigService: OAuthConfigService,
  ) {
    super(oauthConfigService.getConfig());
  }

  async validate(
    accessToken: string, 
    refreshToken: string, 
    profile: Profile
  ): Promise<User> {
    const { id, name, emails, photos } = profile;
    
    const user: User = {
      googleId: id,
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value,
      accessToken,
    };
    
    // In a real implementation, you would:
    // 1. Check if the user exists in the database
    // 2. Create the user if they don't exist
    // 3. Update user info if necessary
    // 4. Return the user object for Passport
    
    return user;
  }
} 