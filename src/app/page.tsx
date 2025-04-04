import { redirect } from 'next/navigation';

export default function Home() {
  // Перенаправляем пользователя на страницу таймера
  redirect('/timer');
}
