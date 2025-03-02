// Helper function to set an auth cookie for testing purposes
export function setAuthCookie() {
  if (typeof document !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!document.cookie.includes('auth_session')) {
      document.cookie = 'auth_session=demo-session; path=/; max-age=86400';
      console.log('Auth cookie set for development');
    }
  }
} 