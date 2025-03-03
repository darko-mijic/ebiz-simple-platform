import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
// Import the package without types
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Define interfaces for the transformer
interface LogData {
  message: string;
  level: string;
  meta: Record<string, any>;
  [key: string]: any;
}

// Type for log method parameters to support both string messages and structured data
type LogParams = string | Record<string, any>;

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const environment = this.configService.get<string>('NODE_ENV') || 'development';
    const logLevel = this.configService.get<string>('LOG_LEVEL') || 'info';

    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Define our custom formats
    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
    ];

    // For development, use colorized console output
    if (environment === 'development') {
      formats.push(
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        }),
        winston.format.colorize({ all: true }),
      );
    } else {
      // For production, use JSON format for structured logging
      formats.push(winston.format.json());
    }

    // Create transport array with winston transports
    const winstonTransports: winston.transport[] = [
      new winston.transports.Console(),
      // Always use file transports for both development and production
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ];

    // Add Elasticsearch transport if enabled and available
    const esHost = this.configService.get<string>('ELASTICSEARCH_HOST') || 'http://localhost:9200';
    try {
      // Create the Elasticsearch transport with proper timestamp configuration
      const esTransport = new ElasticsearchTransport({
        level: 'info',
        index: 'ebiz-logs',
        clientOpts: {
          node: esHost,
          maxRetries: 5,
          requestTimeout: 10000,
          sniffOnStart: false
        },
        transformer: (logData: LogData) => {
          // Ensure proper ISO format for @timestamp field that Kibana requires
          return {
            '@timestamp': new Date().toISOString(), // Use proper ISO format
            message: logData.message,
            severity: logData.level,
            fields: {
              ...logData.meta,
              service: 'ebiz-saas-api'
            }
          };
        }
      }) as any;
      
      winstonTransports.push(esTransport);
      console.log(`Elasticsearch transport configured at ${esHost}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Could not initialize Elasticsearch transport: ${errorMessage}`);
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(...formats),
      defaultMeta: { service: 'ebiz-saas-api' },
      transports: winstonTransports
    });

    this.logger.info(`Logger initialized in ${environment} mode with level ${logLevel}`);
  }

  // Overloaded methods to support both string messages and structured data
  log(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void {
    this.processLog('info', message, contextOrMeta, meta);
  }

  error(message: string, traceOrMeta?: string | Record<string, any>, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void {
    // Handle both string trace and structured meta
    if (typeof traceOrMeta === 'string') {
      this.processLog('error', message, contextOrMeta, [...meta, { trace: traceOrMeta }]);
    } else {
      this.processLog('error', message, traceOrMeta, meta);
    }
  }

  warn(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void {
    this.processLog('warn', message, contextOrMeta, meta);
  }

  debug(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void {
    this.processLog('debug', message, contextOrMeta, meta);
  }

  verbose(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void {
    this.processLog('verbose', message, contextOrMeta, meta);
  }

  // Helper method to handle both string context and structured data
  private processLog(level: string, message: string, contextOrMeta?: string | Record<string, any>, meta: any[] = []): void {
    // Safe way to access dynamic logger methods
    const logMethod = this.getLoggerMethod(level);
    
    if (typeof contextOrMeta === 'string') {
      // If context is a string, use it as context field
      logMethod(message, { context: contextOrMeta, ...this.formatMeta(meta) });
    } else if (contextOrMeta && typeof contextOrMeta === 'object') {
      // If context is an object, merge it with other meta
      logMethod(message, { ...contextOrMeta, ...this.formatMeta(meta) });
    } else {
      // If no context, just log the message and meta
      logMethod(message, this.formatMeta(meta));
    }
  }
  
  // Helper to safely get logger methods by name
  private getLoggerMethod(level: string): (message: string, meta?: any) => void {
    switch (level) {
      case 'info':
        return this.logger.info.bind(this.logger);
      case 'error':
        return this.logger.error.bind(this.logger);
      case 'warn':
        return this.logger.warn.bind(this.logger);
      case 'debug':
        return this.logger.debug.bind(this.logger);
      case 'verbose':
        return this.logger.verbose.bind(this.logger);
      default:
        return this.logger.info.bind(this.logger);
    }
  }

  // Add info method that's referenced in some parts of the code
  info(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void {
    this.processLog('info', message, contextOrMeta, meta);
  }

  // Auth specific logging methods
  logAuth(action: string, userId?: string, details?: any): void {
    this.logger.info(`Auth: ${action}`, {
      module: 'auth',
      userId,
      ...details,
    });
  }

  logAuthError(action: string, error: any, userId?: string, details?: any): void {
    this.logger.error(`Auth Error: ${action}`, {
      module: 'auth',
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...details,
    });
  }

  // Helper to format additional metadata
  private formatMeta(meta: any[]): Record<string, any> {
    if (!meta || meta.length === 0) {
      return {};
    }

    if (meta.length === 1 && typeof meta[0] === 'object') {
      return meta[0];
    }

    return { meta };
  }
} 