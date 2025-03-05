import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service that provides OAuth configuration based on environment
 * This allows switching between real Google OAuth and the mock server
 */
@Injectable()
export class OAuthConfigService {
  constructor(private configService: ConfigService) {}

  getConfig() {
    const useMockOAuth = this.configService.get<string>('USE_MOCK_OAUTH') === 'true';
    
    if (useMockOAuth) {
      const mockHost = this.configService.get<string>('MOCK_OAUTH_HOST', 'http://localhost:8080');
      return {
        clientID: this.configService.get<string>('MOCK_CLIENT_ID', 'mock-client-id'),
        clientSecret: this.configService.get<string>('MOCK_CLIENT_SECRET', 'mock-client-secret'),
        callbackURL: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
        scope: ['profile', 'email'],
        authorizationURL: `${mockHost}/auth`,
        tokenURL: `${mockHost}/token`,
        userProfileURL: `${mockHost}/userinfo`,
      };
    }
    
    // Default to real Google OAuth
    return {
      clientID: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
      // Use standard Google OAuth endpoints
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    };
  }
} 