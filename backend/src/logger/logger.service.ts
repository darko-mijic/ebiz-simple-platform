import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context: string = 'Application';

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');
    
    // Define log formats
    const consoleFormat = format.combine(
      format.timestamp(),
      format.colorize(),
      format.printf(({ timestamp, level, message, context, ...meta }) => {
        return `${timestamp} [${context || this.context}] ${level}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
    );
    
    // JSON format for machine processing (without colors)
    const jsonFormat = format.combine(
      format.timestamp(),
      format.uncolorize(), // Remove color codes
      format.json()
    );
    
    // Human-readable format for file logs (without colors)
    const readableFormat = format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      format.uncolorize(),
      format.printf(({ timestamp, level, message, context, service, ...meta }) => {
        const metaStr = Object.keys(meta).length 
          ? ` ${JSON.stringify(meta)}`
          : '';
        return `${timestamp} [${context || this.context}] ${level.toUpperCase()}: ${message}${metaStr}`;
      })
    );
    
    // Create logger instance
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      defaultMeta: { service: 'backend' },
      transports: [
        // Console transport for development
        new transports.Console({
          format: consoleFormat,
        }),
        // JSON file transports for machine processing
        new transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          format: jsonFormat,
        }),
        new transports.File({
          filename: path.join(logDir, 'combined.log'),
          format: jsonFormat,
        }),
        // Human-readable file transports
        new transports.File({
          filename: path.join(logDir, 'readable-error.log'),
          level: 'error',
          format: readableFormat,
        }),
        new transports.File({
          filename: path.join(logDir, 'readable.log'),
          format: readableFormat,
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: string, context?: string, ...meta: any[]) {
    this.logger.info(message, { context: context || this.context, ...this.flattenMeta(meta) });
  }

  error(message: string, trace?: string, context?: string, ...meta: any[]) {
    this.logger.error(message, { 
      context: context || this.context, 
      trace,
      ...this.flattenMeta(meta)
    });
  }

  warn(message: string, context?: string, ...meta: any[]) {
    this.logger.warn(message, { context: context || this.context, ...this.flattenMeta(meta) });
  }

  debug(message: string, context?: string, ...meta: any[]) {
    this.logger.debug(message, { context: context || this.context, ...this.flattenMeta(meta) });
  }

  verbose(message: string, context?: string, ...meta: any[]) {
    this.logger.verbose(message, { context: context || this.context, ...this.flattenMeta(meta) });
  }

  // Helper method to flatten metadata objects
  private flattenMeta(meta: any[]): object {
    if (!meta || meta.length === 0) return {};
    
    if (meta.length === 1 && typeof meta[0] === 'object') {
      return meta[0];
    }
    
    return { meta };
  }
} 