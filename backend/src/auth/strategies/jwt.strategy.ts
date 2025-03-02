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
    this.logger.debug('Validating JWT token', 'JwtStrategy', { 
      userId: payload.sub,
      email: payload.email,
      hasCookie: !!req.cookies?.auth_session,
      hasAuthHeader: req.headers.authorization?.startsWith('Bearer ') || false,
    });
    
    const user = await this.authService.getUserById(payload.sub);
    
    if (!user) {
      this.logger.logAuthError('JWT validation failed - user not found', 'User not found', payload.sub);
      throw new UnauthorizedException('User not found');
    }
    
    this.logger.logAuth('JWT validation successful', user.id);
    return user;
  }
} 