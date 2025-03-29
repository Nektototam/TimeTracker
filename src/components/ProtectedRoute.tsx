"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="app-container">
        <div className="screen flex justify-center items-center">
          <div className="text-center">
            <div className="spinner"></div>
            <p className="mt-4 text-secondary">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
} 