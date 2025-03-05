// Logger utility for frontend
// This provides structured logging in the browser console and can optionally send logs to the backend

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

// Generate a random session ID for this browser session
const SESSION_ID = Math.random().toString(36).substring(2, 15);

// Get or create a user ID from localStorage
const getUserId = (): string => {
  const storedId = localStorage.getItem('userId');
  if (storedId) return storedId;
  
  const newId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('userId', newId);
  return newId;
};

class Logger {
  private context: string = 'Frontend';
  private serverLoggingEndpoint: string = '/api/logs';
  private serverLoggingEnabled: boolean = false;
  private consoleLoggingEnabled: boolean = true;
  private logLevel: LogLevel = 'info';
  private userId?: string;
  
  constructor() {
    // Try to get user ID if user is logged in
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.userId = user.id;
      }
    } catch (e) {
      // Ignore errors in getting user ID
    }
    
    // Set log level from localStorage or environment
    this.setLogLevel((process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info');
    
    // Enable/disable server logging based on environment
    this.serverLoggingEnabled = process.env.NEXT_PUBLIC_SERVER_LOGGING === 'true';
  }
  
  setContext(context: string): Logger {
    this.context = context;
    return this;
  }
  
  setLogLevel(level: LogLevel): Logger {
    this.logLevel = level;
    return this;
  }
  
  enableServerLogging(enabled: boolean = true): Logger {
    this.serverLoggingEnabled = enabled;
    return this;
  }
  
  enableConsoleLogging(enabled: boolean = true): Logger {
    this.consoleLoggingEnabled = enabled;
    return this;
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }
  
  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.context,
      data,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId: this.userId,
      sessionId: SESSION_ID
    };
  }
  
  private async sendToServer(entry: LogEntry): Promise<void> {
    if (!this.serverLoggingEnabled) return;
    
    try {
      await fetch(this.serverLoggingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry),
        // Don't wait for response or handle errors
        keepalive: true
      });
    } catch (e) {
      // Silently fail if server logging fails
      // We don't want logging to break the application
    }
  }
  
  private logToConsole(entry: LogEntry): void {
    if (!this.consoleLoggingEnabled) return;
    
    const { level, message, context, data, timestamp } = entry;
    const formattedMessage = `[${timestamp}] [${context}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  }
  
  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, context, data);
    this.logToConsole(entry);
    this.sendToServer(entry);
  }
  
  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, context, data);
    this.logToConsole(entry);
    this.sendToServer(entry);
  }
  
  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, context, data);
    this.logToConsole(entry);
    this.sendToServer(entry);
  }
  
  error(message: string, context?: string, error?: Error, data?: any): void {
    if (!this.shouldLog('error')) return;
    
    const errorData = error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...data
    } : data;
    
    const entry = this.createLogEntry('error', message, context, errorData);
    this.logToConsole(entry);
    this.sendToServer(entry);
  }
  
  // Log page navigation
  pageView(path: string): void {
    this.info(`Page view: ${path}`, 'Navigation');
  }
  
  // Log user actions
  userAction(action: string, details?: any): void {
    this.info(`User action: ${action}`, 'UserAction', details);
  }
  
  // Log API requests
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, 'API', data);
  }
  
  // Log API responses
  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (status >= 400) {
      this.warn(`API ${method} ${url} responded with ${status}`, 'API', data);
    } else {
      this.debug(`API ${method} ${url} responded with ${status}`, 'API', data);
    }
  }
}

// Create a singleton instance
const logger = new Logger();

// Set up global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error(
      'Uncaught error',
      'Window',
      new Error(event.message),
      { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(
      'Unhandled promise rejection',
      'Window',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    );
  });
}

export default logger; 