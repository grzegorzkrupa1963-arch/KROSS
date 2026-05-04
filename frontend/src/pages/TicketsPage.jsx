import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ticketsApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import Layout from '../components/common/Layout';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import useAuthStore from '../store/authStore';

const STATUSES   = ['', 'open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const STATUS_PL   = { '': 'Wszystkie statusy', open: 'Otwarte', in_progress: 'W toku', resolved: 'Rozwiązane', closed: 'Zamknięte' };
const PRIORITY_PL = { '': 'Wszystkie priorytety', low: 'Niski', medium: 'Średni', high: 'Wysoki', critical: 'Krytyczny' };

function formatDate(iso) {
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function userName(u) {
  if (!u) return '—';
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
  return full || u.email;
}

export default function TicketsPage() {
  const [page, setPage]           = useState(1);
  const [status, setStatus]       = useState('');
  const [priority, setPriority]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const isAgent   = user?.role === 'agent' || user?.role === 'admin';
  const limit = 15;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tickets', page, status, priority],
    queryFn: () =>
      ticketsApi.list({ page, limit, ...(status && { status }), ...(priority && { priority }) })
        .then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  function handleFilterChange(setter) {
    return (e) => { setter(e.target.value); setPage(1); };
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Nagłówek */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isAgent ? 'Wszystkie zgłoszenia' : 'Moje zgłoszenia'}
            </h2>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">
                Łącznie: {data.total} {data.total === 1 ? 'zgłoszenie' : 'zgłoszeń'}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            + Nowe zgłoszenie
          </button>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={handleFilterChange(setStatus)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_PL[s]}</option>)}
          </select>
          <select
            value={priority}
            onChange={handleFilterChange(setPriority)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_PL[p]}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Ładowanie zgłoszeń…
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-48 text-red-500 text-sm">
              Błąd: {error?.response?.data?.error || error?.message || 'Nie udało się pobrać zgłoszeń'}
            </div>
          )}

          {!isLoading && !isError && data?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-3-3v6M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              <span className="text-sm">Brak zgłoszeń spełniających kryteria</span>
            </div>
          )}

          {!isLoading && !isError && data?.data?.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Tytuł</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 hidden md:table-cell">Priorytet</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Kategoria</th>
                  {isAgent && <th className="px-4 py-3 hidden lg:table-cell">Autor</th>}
                  <th className="px-4 py-3 hidden md:table-cell">Data utworzenia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 leading-tight">{ticket.title}</div>
                      <div className="flex gap-2 mt-1 sm:hidden">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                      {ticket.category?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    {isAgent && (
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                        {userName(ticket.created_by)}
                      </td>
                    )}
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 whitespace-nowrap">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginacja */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Strona {page} z {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Poprzednia
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Następna →
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <CreateTicketModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
