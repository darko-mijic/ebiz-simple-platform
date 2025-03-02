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

  // Standard logger methods
  log(message: string, context?: string, ...meta: any[]): void {
    this.logger.info(message, { context, ...this.formatMeta(meta) });
  }

  error(message: string, trace?: string, context?: string, ...meta: any[]): void {
    this.logger.error(message, { trace, context, ...this.formatMeta(meta) });
  }

  warn(message: string, context?: string, ...meta: any[]): void {
    this.logger.warn(message, { context, ...this.formatMeta(meta) });
  }

  debug(message: string, context?: string, ...meta: any[]): void {
    this.logger.debug(message, { context, ...this.formatMeta(meta) });
  }

  verbose(message: string, context?: string, ...meta: any[]): void {
    this.logger.verbose(message, { context, ...this.formatMeta(meta) });
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
      error: error.message || error,
      stack: error.stack,
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