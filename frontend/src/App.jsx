import { Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Navigate to="/tickets" replace />} />
      <Route path="/login"       element={<div>Login — TODO</div>} />
      <Route path="/tickets"     element={<div>Ticket list — TODO</div>} />
      <Route path="/tickets/:id" element={<div>Ticket detail — TODO</div>} />
      <Route path="/admin/*"     element={<div>Admin panel — TODO</div>} />
      <Route path="*"            element={<div>404 — Not found</div>} />
    </Routes>
  );
}
