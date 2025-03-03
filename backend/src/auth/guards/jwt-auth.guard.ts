import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Log the auth attempt
    const request = context.switchToHttp().getRequest();
    const path = request.path;
    const method = request.method;
    
    this.logger.debug(`JWT authentication attempt for ${path}`, { 
      path, 
      method 
    });
    
    // Return the parent canActivate method
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      // Log authentication failure
      const request = context.switchToHttp().getRequest();
      const path = request.path;
      
      this.logger.warn(`JWT authentication failed for ${path}`, { 
        path, 
        error: err?.message || 'No user found', 
        info 
      });
    } else {
      // Log successful authentication
      const userId = user.id || user.sub;
      this.logger.debug(`JWT authentication successful for user ${userId}`, { 
        userId 
      });
    }
    
    // Let the parent class handle the rest
    return super.handleRequest(err, user, info, context);
  }
} 