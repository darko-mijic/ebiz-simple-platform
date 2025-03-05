import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that ensures all requests have a correlation ID
 * If a request already has a correlation ID in the headers, it will be used
 * Otherwise, a new correlation ID will be generated
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check if correlation ID already exists in request headers
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    
    // Set correlation ID in request headers
    req.headers['x-correlation-id'] = correlationId;
    
    // Set correlation ID in response headers
    res.setHeader('x-correlation-id', correlationId);
    
    next();
  }
} 