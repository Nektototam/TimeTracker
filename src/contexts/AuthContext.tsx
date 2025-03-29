"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function getSession() {
      setIsLoading(true);
      
      // Проверяем текущую сессию
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Ошибка при получении сессии:', error);
      }
      
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      
      setIsLoading(false);
    }
    
    // Получаем сессию при загрузке
    getSession();
    
    // Подписываемся на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };
  
  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 