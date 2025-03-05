import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

// Define a type for the Express request with user
interface RequestWithUser extends Request {
  user?: {
    id?: string;
    [key: string]: any;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();
    
    // Get correlation ID if available
    const correlationId = request.headers['x-correlation-id'] || 'unknown';
    
    // Get status code and message based on exception type
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    let message: string;
    let error: string;
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        // Extract message and error from exception response
        message = (exceptionResponse as any)?.message || exception.message;
        error = (exceptionResponse as any)?.error || 'Error';
        
        // If message is an array (validation errors), join them
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      } else {
        message = exception.message;
        error = 'Error';
      }
    } else {
      // For non-HTTP exceptions, use generic message for clients
      message = 'Internal server error';
      error = 'Internal Server Error';
      
      // Only log detailed error information for server logs
      this.logger.error(
        `${request.method} ${request.url} - ${exception.message || 'Unknown error'}`,
        {
          correlationId,
          path: request.url,
          method: request.method,
          statusCode: status,
          error: exception.message || 'Unknown error',
          stack: exception.stack,
          userId: request.user?.id,
        }
      );
    }
    
    // Structure the response
    const responseBody = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    
    // Log error information for non-500 errors that might be important
    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.warn(
        `${request.method} ${request.url} - Status ${status}: ${message}`,
        {
          correlationId,
          path: request.url,
          method: request.method,
          statusCode: status,
          userId: request.user?.id,
        }
      );
    }
    
    // Send sanitized response to client
    response.status(status).json(responseBody);
  }
} 