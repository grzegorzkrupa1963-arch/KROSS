import { Routes, Route, Navigate } from 'react-router-dom';
import useBootstrap from './hooks/useBootstrap';
import RequireAuth from './components/common/RequireAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketsPage from './pages/TicketsPage';

export default function App() {
  const ready = useBootstrap();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Ładowanie…</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/tickets"
        element={<RequireAuth><TicketsPage /></RequireAuth>}
      />
      <Route path="/" element={<Navigate to="/tickets" replace />} />
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}
