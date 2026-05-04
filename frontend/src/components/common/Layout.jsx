import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../services/api';

const ROLE_BADGE = {
  admin: { label: 'Admin',  cls: 'bg-purple-500/20 text-purple-200 border-purple-500/30' },
  agent: { label: 'Agent',  cls: 'bg-sky-500/20    text-sky-200    border-sky-500/30' },
  user:  { label: 'Użytkownik', cls: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

function Avatar({ user }) {
  const initial = (user?.first_name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {initial}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const roleCfg   = ROLE_BADGE[user?.role] ?? ROLE_BADGE.user;

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignoruj */ }
    logout();
    navigate('/login');
  }

  const isActive = (to) => location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <Link to="/tickets" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">K</div>
              <span className="text-white font-semibold text-sm tracking-wide hidden sm:block">KROSS Helpdesk</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to="/tickets"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors font-medium
                  ${isActive('/tickets')
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                Zgłoszenia
              </Link>
            </nav>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5">
                <Avatar user={user} />
                <div className="flex flex-col leading-none">
                  <span className="text-white text-xs font-medium">
                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
                  </span>
                  <span className={`mt-0.5 self-start text-xs px-1.5 py-px rounded border font-medium ${roleCfg.cls}`}>
                    {roleCfg.label}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
