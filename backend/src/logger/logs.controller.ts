import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LoggerService } from './logger.service';

interface ClientLogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  data?: any;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

@Controller('logs')
export class LogsController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('ClientLogs');
  }

  @Post()
  @HttpCode(204)
  receiveClientLogs(@Body() logEntry: ClientLogEntry): void {
    const { level, message, context, ...meta } = logEntry;
    
    switch (level) {
      case 'debug':
        this.logger.debug(message, context, meta);
        break;
      case 'info':
        this.logger.log(message, context, meta);
        break;
      case 'warn':
        this.logger.warn(message, context, meta);
        break;
      case 'error':
        this.logger.error(message, meta.data?.stack, context, meta);
        break;
      default:
        this.logger.log(message, context, meta);
    }
  }
} 