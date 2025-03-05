import { useContext } from 'react';
import { useUser as useUserFromProvider } from '../components/providers/user-provider';

// Re-export the useUser hook for convenience
export const useUser = useUserFromProvider; 