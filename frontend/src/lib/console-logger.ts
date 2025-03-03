/**
 * Enhanced console logger with color formatting and standardized output for frontend debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogOptions {
  showTimestamp?: boolean;
  groupName?: string;
  collapsed?: boolean;
  data?: any;
}

// Color codes for different log types
const COLORS = {
  info: '#3498db',    // Blue
  warn: '#f39c12',    // Orange
  error: '#e74c3c',   // Red
  debug: '#9b59b6',   // Purple
  success: '#2ecc71', // Green
  timestamp: '#7f8c8d' // Gray
};

// Emoji for different log types
const EMOJIS = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '🔥',
  debug: '🔍',
  success: '✅',
  auth: '🔒',
  api: '🌐',
  user: '👤',
  form: '📝',
  nav: '🧭',
  perf: '⚡',
  ui: '🎨'
};

/**
 * Checks if the logger should be enabled based on environment variables
 */
const isEnabled = (feature?: string): boolean => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Always enable in development unless explicitly disabled
  if (isDev && process.env.NEXT_PUBLIC_DISABLE_LOGGER !== 'true') {
    return true;
  }
  
  // Enable specific features in production if explicitly enabled
  if (feature && process.env.NEXT_PUBLIC_ENABLE_LOGGER?.includes(feature)) {
    return true;
  }
  
  return false;
};

/**
 * Format a message with timestamp, level, and optional emoji
 */
const formatMessage = (
  level: LogLevel, 
  message: string, 
  emoji?: keyof typeof EMOJIS, 
  showTimestamp: boolean = true
): string => {
  const parts: string[] = [];
  
  // Add timestamp if enabled
  if (showTimestamp) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    parts.push(`%c${timestamp}`);
  }
  
  // Add emoji if provided
  if (emoji && EMOJIS[emoji]) {
    parts.push(EMOJIS[emoji]);
  }
  
  // Add level
  parts.push(`%c${level.toUpperCase()}`);
  
  // Add message
  parts.push(`%c${message}`);
  
  return parts.join(' ');
};

/**
 * Get styles for console log formatting
 */
const getStyles = (level: LogLevel, showTimestamp: boolean = true): string[] => {
  const styles: string[] = [];
  
  // Timestamp style
  if (showTimestamp) {
    styles.push(`color: ${COLORS.timestamp}; font-weight: normal;`);
  }
  
  // Level style
  styles.push(`color: white; background-color: ${COLORS[level]}; font-weight: bold; padding: 2px 4px; border-radius: 3px;`);
  
  // Message style
  styles.push(`color: ${COLORS[level]}; font-weight: normal;`);
  
  return styles;
};

/**
 * Create a logger instance for a specific feature
 */
export const createLogger = (feature: string) => {
  // Only create the logger if enabled
  if (!isEnabled(feature)) {
    // Return empty no-op functions if logging is disabled
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      success: () => {},
      group: () => ({ end: () => {} }),
    };
  }
  
  const logWithLevel = (
    level: LogLevel, 
    message: string, 
    emoji?: keyof typeof EMOJIS,
    options: LogOptions = {}
  ) => {
    const { showTimestamp = true, data, groupName, collapsed = false } = options;
    
    // Format the message with emoji and level
    const formattedMsg = formatMessage(level, message, emoji, showTimestamp);
    
    // Get styles for the message
    const styles = getStyles(level, showTimestamp);
    
    // Start a group if specified
    if (groupName) {
      if (collapsed) {
        console.groupCollapsed(`%c${feature} - ${groupName}`, `color: ${COLORS[level]}; font-weight: bold;`);
      } else {
        console.group(`%c${feature} - ${groupName}`, `color: ${COLORS[level]}; font-weight: bold;`);
      }
    }
    
    // Log the message
    console.log(formattedMsg, ...styles);
    
    // Log data if provided
    if (data !== undefined) {
      console.dir(data, { depth: null, colors: true });
    }
    
    // End group if started
    if (groupName) {
      console.groupEnd();
    }
  };
  
  // Create a grouped logger
  const group = (name: string, level: LogLevel = 'info', collapsed: boolean = false) => {
    if (collapsed) {
      console.groupCollapsed(`%c${feature} - ${name}`, `color: ${COLORS[level]}; font-weight: bold;`);
    } else {
      console.group(`%c${feature} - ${name}`, `color: ${COLORS[level]}; font-weight: bold;`);
    }
    
    return {
      end: () => console.groupEnd()
    };
  };
  
  // Create specific log level functions
  return {
    info: (message: string, data?: any, emoji?: keyof typeof EMOJIS) => 
      logWithLevel('info', message, emoji, { data }),
    
    warn: (message: string, data?: any, emoji?: keyof typeof EMOJIS) => 
      logWithLevel('warn', message, emoji, { data }),
    
    error: (message: string, data?: any, emoji?: keyof typeof EMOJIS) => 
      logWithLevel('error', message, emoji, { data }),
    
    debug: (message: string, data?: any, emoji?: keyof typeof EMOJIS) => 
      logWithLevel('debug', message, emoji, { data }),
    
    success: (message: string, data?: any, emoji?: keyof typeof EMOJIS) => 
      logWithLevel('success', message, emoji, { data }),
    
    group
  };
};

// Create pre-configured loggers for common features
export const authLogger = createLogger('auth');
export const apiLogger = createLogger('api');
export const formLogger = createLogger('form');
export const userLogger = createLogger('user');
export const navLogger = createLogger('navigation');
export const uiLogger = createLogger('ui');

// Export the default logger
export default {
  auth: authLogger,
  api: apiLogger,
  form: formLogger,
  user: userLogger,
  nav: navLogger,
  ui: uiLogger,
}; 