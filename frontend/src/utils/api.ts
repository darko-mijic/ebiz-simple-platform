import logger from './logger';

/**
 * Enhanced fetch function with logging
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The fetch response
 */
export async function fetchWithLogging(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';
  
  // Log the request
  logger.apiRequest(method, url, options.body);
  
  try {
    const response = await fetch(url, options);
    
    // Log the response
    logger.apiResponse(method, url, response.status);
    
    // If the response is not ok, log an error
    if (!response.ok) {
      let errorData;
      try {
        // Try to parse the error response as JSON
        errorData = await response.clone().json();
      } catch (e) {
        // If it's not JSON, get the text
        errorData = await response.clone().text();
      }
      
      logger.warn(
        `API error: ${method} ${url} responded with ${response.status}`,
        'API',
        { status: response.status, statusText: response.statusText, data: errorData }
      );
    }
    
    return response;
  } catch (error) {
    // Log network errors
    logger.error(
      `API network error: ${method} ${url}`,
      'API',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Enhanced fetch function with JSON parsing and logging
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The parsed JSON response
 */
export async function fetchJsonWithLogging<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithLogging(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });
  
  return response.json();
}

/**
 * POST JSON data with logging
 * @param url - The URL to post to
 * @param data - The data to post
 * @param options - Additional fetch options
 * @returns The parsed JSON response
 */
export async function postJsonWithLogging<T = any, D = any>(
  url: string,
  data: D,
  options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<T> {
  return fetchJsonWithLogging<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT JSON data with logging
 * @param url - The URL to put to
 * @param data - The data to put
 * @param options - Additional fetch options
 * @returns The parsed JSON response
 */
export async function putJsonWithLogging<T = any, D = any>(
  url: string,
  data: D,
  options: Omit<RequestInit, 'method' | 'body'> = {}
): Promise<T> {
  return fetchJsonWithLogging<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request with logging
 * @param url - The URL to delete
 * @param options - Additional fetch options
 * @returns The parsed JSON response
 */
export async function deleteWithLogging<T = any>(
  url: string,
  options: Omit<RequestInit, 'method'> = {}
): Promise<T> {
  return fetchJsonWithLogging<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

// Export default object with all methods
export default {
  fetch: fetchWithLogging,
  fetchJson: fetchJsonWithLogging,
  post: postJsonWithLogging,
  put: putJsonWithLogging,
  delete: deleteWithLogging,
}; 