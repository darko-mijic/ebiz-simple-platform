import axios from 'axios';

/**
 * Sanitizes API error messages to ensure they are user-friendly
 * and don't expose implementation details or stack traces
 * 
 * @param error Any error caught during API requests
 * @returns User-friendly error message
 */
export function handleApiError(error: unknown): string {
  // Default error message
  let errorMessage = 'An unexpected error occurred. Please try again or contact support.';
  
  if (axios.isAxiosError(error) && error.response) {
    // Extract data from Axios error response
    const responseData = error.response.data;
    const statusCode = error.response.status;
    
    // Log the full error for debugging (only appears in console, not to user)
    console.error('API Error:', {
      status: statusCode,
      url: error.config?.url,
      method: error.config?.method,
      data: responseData
    });
    
    // Common HTTP status code handling
    if (statusCode === 401 || statusCode === 403) {
      return 'Authentication error. Please sign in again.';
    }
    
    if (statusCode === 404) {
      return 'The requested resource was not found.';
    }
    
    if (statusCode >= 500) {
      return 'Server error. Our team has been notified.';
    }
    
    // Extract error message from response if available
    if (typeof responseData === 'object' && responseData !== null) {
      const message = responseData.message || responseData.error;
      
      // Sanitize the message to avoid exposing implementation details
      if (message && typeof message === 'string') {
        // Don't display stack traces or very long messages
        if (!message.includes('Error:') && 
            !message.includes('at ') && 
            message.length < 150) {
          return message;
        }
      }
    }
    
    // Default message based on status code
    return `Request failed with status code ${statusCode}.`;
  } else if (error instanceof Error) {
    // For standard Error objects
    const message = error.message;
    
    // Log the error for debugging
    console.error('Standard error:', error);
    
    // Sanitize to avoid exposing implementation details
    if (!message.includes('Error:') && 
        !message.includes('at ') && 
        message.length < 150) {
      return message;
    }
  } else {
    // For unknown error types
    console.error('Unknown error type:', error);
  }
  
  return errorMessage;
} 