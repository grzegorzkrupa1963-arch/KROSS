import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../services/api';
import Button from './Button';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignoruj błędy sieciowe */ }
    logout();
    navigate('/login');
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-2 rounded-md transition-colors
        ${location.pathname.startsWith(to)
          ? 'bg-blue-700 text-white'
          : 'text-blue-100 hover:bg-blue-700 hover:text-white'}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-white font-bold text-lg tracking-wide">KROSS Helpdesk</span>
            {navLink('/tickets', 'Zgłoszenia')}
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-blue-200 text-sm hidden sm:block">
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
              </span>
            )}
            <Button variant="secondary" onClick={handleLogout} className="text-xs py-1.5">
              Wyloguj
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
