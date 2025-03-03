import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../common/logger/logger.service';
import { Request } from 'express';

// Create a function to extract JWT from either cookies or auth header
const extractJWT = (req: Request) => {
  let token = null;
  
  // First try to get from cookie
  if (req.cookies && req.cookies.auth_session) {
    token = req.cookies.auth_session;
  }
  
  // If no token in cookie, try from Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: extractJWT, // Use our custom extractor
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // Pass the request to the callback for logging
    });
    
    this.logger.log('JWT strategy initialized', 'JwtStrategy');
  }

  async validate(req: Request, payload: any) {
    this.logger.debug('Validating JWT token', { 
      userId: payload.sub,
      email: payload.email,
      hasCookie: !!req.cookies?.auth_session,
      hasAuthHeader: req.headers.authorization?.startsWith('Bearer ') || false,
    });
    
    // Check if user exists in database
    const user = await this.authService.getUserById(payload.sub);
    
    if (!user) {
      this.logger.warn('JWT validation warning - user not found but token is valid', {
        userId: payload.sub,
        tokenEmail: payload.email,
        message: 'This can happen after database resets or if the user was deleted'
      });
      
      // We should still return the payload instead of throwing an error
      // This allows the controller to handle the "user not found" case
      // and properly clear the cookie
      return {
        sub: payload.sub,
        email: payload.email,
        iat: payload.iat,
        exp: payload.exp,
        // Flag to indicate the token is valid but user doesn't exist
        userMissing: true
      };
    }
    
    this.logger.logAuth('JWT validation successful', user.id);
    
    // Pass the payload directly instead of the user object
    // This matches the JwtPayload interface in auth.controller.ts
    return {
      sub: payload.sub, 
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp
    };
  }
} 