import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
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
        exception.stack,
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
      );
    }
    
    // Send sanitized response to client
    response.status(status).json(responseBody);
  }
} 