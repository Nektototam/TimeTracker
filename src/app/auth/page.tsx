"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (mode === 'signup') {
        await api.auth.register(email, password);
        await refresh();
        setMessage('Регистрация успешна. Теперь можно войти.');
      } else {
        await api.auth.login(email, password);
        await refresh();
        router.push('/');
      }
    } catch (error: any) {
      setMessage(error.message || 'Произошла ошибка при авторизации');
      console.error('Ошибка авторизации:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <div className="screen">
        <h1 className="text-center text-[#32325d] font-bold text-2xl mb-4">
          {mode === 'signin' ? 'Вход в TimeTracker' : 'Регистрация в TimeTracker'}
        </h1>
        
        {message && (
          <div className="text-center mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
            {message}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="auth-form">
          <div className="mb-4">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="auth-label">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          {mode === 'signin' && (
            <div className="mb-6">
              <div className="flex items-center">
                <label className="remember-me-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="remember-me-text">Запомнить меня на этом устройстве</span>
                </label>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {loading ? 'Загрузка...' : (mode === 'signin' ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        <div className="text-center mt-4">
          {mode === 'signin' ? (
            <p>
              Нет аккаунта?{' '}
              <button 
                onClick={() => setMode('signup')}
                className="text-primary hover:underline"
              >
                Зарегистрироваться
              </button>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{' '}
              <button 
                onClick={() => setMode('signin')}
                className="text-primary hover:underline"
              >
                Войти
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 