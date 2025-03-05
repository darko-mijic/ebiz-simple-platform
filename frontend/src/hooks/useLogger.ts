import { useEffect } from 'react';
import { useRouter } from 'next/router';
import logger from '../utils/logger';

/**
 * Custom hook for using the logger in React components
 * @param context - The context to use for logging (e.g. component name)
 * @returns The logger instance with the context set
 */
export function useLogger(context: string) {
  const router = useRouter();
  const contextLogger = logger.setContext(context);
  
  // Log page views
  useEffect(() => {
    // Log initial page view
    contextLogger.pageView(router.pathname);
    
    // Log subsequent page views
    const handleRouteChange = (url: string) => {
      contextLogger.pageView(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, contextLogger]);
  
  return contextLogger;
}

export default useLogger; 