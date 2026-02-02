"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, authToken } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refresh: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const refresh = async () => {
    setIsLoading(true);
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch (error) {
      console.error('Ошибка при получении сессии:', error);
      setUser(null);
      authToken.clear();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    return () => {};
  }, []);
  
  const signOut = async () => {
    await api.auth.logout();
    router.push('/auth');
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 