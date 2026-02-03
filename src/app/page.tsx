import { redirect } from 'next/navigation';

export default function Home() {
  // Перенаправляем пользователя на dashboard
  redirect('/dashboard');
}
