"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type User = {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  iat: number;
  exp: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial load, check if there's a token in localStorage
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      try {
        // Verify the token hasn't expired
        const decodedToken = jwtDecode<User>(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          setToken(storedToken);
          setUser(decodedToken);
        } else {
          // Token expired, clear it
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // When token changes, update localStorage and user state
    if (token) {
      localStorage.setItem("auth_token", token);
      setUser(jwtDecode<User>(token));
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 