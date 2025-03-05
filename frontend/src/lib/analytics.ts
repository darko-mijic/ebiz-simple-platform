/**
 * Analytics module for tracking client-side events
 * This can be expanded later with more sophisticated analytics providers
 */

/**
 * Logs general application events
 * @param eventName The name/type of the event
 * @param data Optional event data
 */
export const logEvents = async (eventName: string, data?: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${eventName}`, { timestamp, ...data });
    return;
  }
  
  // In production, send to backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    await fetch(`${apiUrl}/client-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        timestamp,
        data,
      }),
    });
  } catch (error) {
    // Silent fail for analytics
    console.debug('Failed to log analytics event', error);
  }
};

/**
 * Logs user authentication events
 */
export const logAuth = async (action: string, details?: Record<string, any>) => {
  return logEvents(`auth:${action}`, details);
};

/**
 * Tracks page views
 */
export const trackPageView = (page: string) => {
  return logEvents('pageview', { page });
}; 