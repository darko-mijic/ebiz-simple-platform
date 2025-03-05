import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../common/logger/logger.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly logger: LoggerService,
    private readonly reflector: Reflector
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check for @Public decorator to allow skipping auth for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is marked as public, allow access without authentication
    if (isPublic) {
      return true;
    }

    // Extract request details for logging
    const request = context.switchToHttp().getRequest();
    const path = request.path;
    const method = request.method;
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    // Generate a unique request ID for tracking this auth attempt
    const requestId = `auth-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    request.requestId = requestId;
    
    this.logger.debug(`JWT authentication attempt for ${method} ${path}`, { 
      path, 
      method,
      ip,
      userAgent,
      requestId
    });
    
    // Return the parent canActivate method
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const path = request.path;
    const method = request.method;
    const requestId = request.requestId || 'unknown';
    
    // If there's an error or no user found, handle authentication failure
    if (err || !user) {
      // Extract more context for better error logging
      const ip = this.getClientIp(request);
      const errorInfo = {
        path,
        method,
        ip,
        requestId,
        errorType: err?.name || 'Authentication Error',
        errorMessage: err?.message || 'No user found',
        tokenError: info?.name || info?.message || 'Invalid or missing token',
        userAgent: request.headers['user-agent'] || 'unknown'
      };
      
      // Log authentication failure with detailed context
      this.logger.warn(`JWT authentication failed for ${method} ${path}`, errorInfo);
      
      // Throw a standardized unauthorized exception
      throw new UnauthorizedException('Authentication required or token is invalid');
    }
    
    // Check if user exists but the userMissing flag is set (valid token but user deleted)
    if (user.userMissing) {
      this.logger.warn(`JWT authentication - valid token but user not found in DB`, {
        path,
        method,
        requestId,
        sub: user.sub
      });
      
      throw new UnauthorizedException('User account not found');
    }
    
    // Log successful authentication
    const userId = user.id || user.sub;
    this.logger.debug(`JWT authentication successful for user ${userId}`, { 
      userId,
      path,
      method,
      requestId
    });
    
    // Return the user object for the route handler
    return user;
  }
  
  // Helper method to get client IP address from various headers
  private getClientIp(request: any): string {
    return request.headers['x-forwarded-for'] || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress || 
           'unknown';
  }
} 