"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-app-sm p-6">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">TimeTracker</p>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === 'signin' ? 'Вход в TimeTracker' : 'Регистрация в TimeTracker'}
          </h1>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              fullWidth
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              fullWidth
            />
          </div>

          {mode === 'signin' && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Запомнить меня на этом устройстве
            </label>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            fullWidth
            className="h-11"
          >
            {loading ? 'Загрузка...' : (mode === 'signin' ? 'Войти' : 'Зарегистрироваться')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'signin' ? (
            <p>
              Нет аккаунта?{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => setMode('signup')}
                className="h-auto p-0"
              >
                Зарегистрироваться
              </Button>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => setMode('signin')}
                className="h-auto p-0"
              >
                Войти
              </Button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 