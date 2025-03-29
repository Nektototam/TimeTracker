import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  
  return (
    <nav className="nav-bar">
      <Link
        href="/"
        className={`nav-item ${pathname === "/" ? "active" : ""}`}
      >
        <span className="nav-icon">⏱️</span>
        <span className="nav-text">Таймер</span>
      </Link>
      
      <Link
        href="/statistics"
        className={`nav-item ${pathname === "/statistics" ? "active" : ""}`}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-text">Статистика</span>
      </Link>
      
      <Link
        href="/reports"
        className={`nav-item ${pathname === "/reports" ? "active" : ""}`}
      >
        <span className="nav-icon">📝</span>
        <span className="nav-text">Отчеты</span>
      </Link>
      
      <Link
        href="/pomodoro"
        className={`nav-item ${pathname === "/pomodoro" ? "active" : ""}`}
      >
        <span className="nav-icon">🍅</span>
        <span className="nav-text">Помидор</span>
      </Link>
      
      <Link
        href="/settings"
        className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
      >
        <span className="nav-icon">⚙️</span>
        <span className="nav-text">Настройки</span>
      </Link>
      
      <button
        onClick={() => signOut()}
        className="nav-item logout"
      >
        <span className="nav-icon">🚪</span>
        <span className="nav-text">Выход</span>
      </button>
    </nav>
  );
} 