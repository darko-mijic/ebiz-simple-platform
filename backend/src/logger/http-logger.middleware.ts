import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Log request
    this.logger.log(`${method} ${originalUrl}`, 'Request', { 
      ip, 
      userAgent,
      headers: req.headers,
      query: req.query,
      params: req.params,
    });

    // Track response time
    const start = Date.now();
    
    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - start;
      
      const message = `${method} ${originalUrl} ${statusCode} ${responseTime}ms`;
      
      if (statusCode >= 500) {
        this.logger.error(message, undefined, 'Response', { contentLength });
      } else if (statusCode >= 400) {
        this.logger.warn(message, 'Response', { contentLength });
      } else {
        this.logger.log(message, 'Response', { contentLength });
      }
    });

    next();
  }
} 