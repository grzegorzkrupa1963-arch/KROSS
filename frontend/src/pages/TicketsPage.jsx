import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ticketsApi } from '../services/api';
import { StatusBadge, PriorityBadge, PRIORITY_ROW_COLOR } from '../components/common/Badge';
import Layout from '../components/common/Layout';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import useAuthStore from '../store/authStore';

const STATUSES   = ['', 'open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const STATUS_PL   = { '': 'Wszystkie statusy',    open: 'Otwarte', in_progress: 'W toku', resolved: 'Rozwiązane', closed: 'Zamknięte' };
const PRIORITY_PL = { '': 'Wszystkie priorytety', low: 'Niski',    medium: 'Średni',       high: 'Wysoki',         critical: 'Krytyczny' };

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

function FilterSelect({ value, onChange, options, labels }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
        ${value ? 'border-blue-400 text-blue-700 font-medium' : 'border-gray-300 text-gray-700'}`}
    >
      {options.map((o) => <option key={o} value={o}>{labels[o]}</option>)}
    </select>
  );
}

function Skeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/5" />
          <div className="h-5 bg-gray-200 rounded-full w-20 hidden sm:block" />
          <div className="h-5 bg-gray-200 rounded-full w-16 hidden md:block" />
          <div className="ml-auto h-4 bg-gray-200 rounded w-28 hidden md:block" />
        </div>
      ))}
    </div>
  );
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
  const activeFilters = [status, priority].filter(Boolean).length;

  function handleFilterChange(setter) {
    return (e) => { setter(e.target.value); setPage(1); };
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Nagłówek */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isAgent ? 'Wszystkie zgłoszenia' : 'Moje zgłoszenia'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data
                ? `${data.total} ${data.total === 1 ? 'zgłoszenie' : 'zgłoszeń'}${activeFilters ? ' • filtrowane' : ''}`
                : 'Ładowanie…'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nowe zgłoszenie
          </button>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          <FilterSelect value={status}   onChange={handleFilterChange(setStatus)}   options={STATUSES}   labels={STATUS_PL} />
          <FilterSelect value={priority} onChange={handleFilterChange(setPriority)} options={PRIORITIES} labels={PRIORITY_PL} />
          {activeFilters > 0 && (
            <button
              onClick={() => { setStatus(''); setPriority(''); setPage(1); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              Wyczyść filtry
            </button>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <Skeleton />}

          {isError && (
            <div className="flex items-center justify-center h-48 gap-3 text-red-500 text-sm">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error?.response?.data?.error || error?.message || 'Nie udało się pobrać zgłoszeń'}
            </div>
          )}

          {!isLoading && !isError && data?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Brak zgłoszeń</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeFilters ? 'Zmień filtry lub' : 'Kliknij'} „Nowe zgłoszenie" aby dodać pierwsze
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isError && data?.data?.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pl-5 pr-4 py-3 w-0" />
                  <th className="px-4 py-3">Tytuł</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 hidden md:table-cell">Priorytet</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Kategoria</th>
                  {isAgent && <th className="px-4 py-3 hidden xl:table-cell">Autor</th>}
                  <th className="px-4 py-3 hidden md:table-cell text-right">Utworzono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`border-l-4 hover:bg-blue-50/50 transition-colors cursor-pointer group ${PRIORITY_ROW_COLOR[ticket.priority] ?? 'border-l-transparent'}`}
                  >
                    <td className="pl-1 pr-0 py-3.5" />
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {ticket.title}
                      </div>
                      <div className="flex gap-1.5 mt-1.5 sm:hidden">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-500">
                      {ticket.category?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    {isAgent && (
                      <td className="px-4 py-3.5 hidden xl:table-cell text-gray-500 text-xs">
                        {userName(ticket.created_by)}
                      </td>
                    )}
                    <td className="px-4 py-3.5 hidden md:table-cell text-gray-400 text-xs text-right whitespace-nowrap">
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
            <span className="text-gray-500 text-xs">
              Strona <span className="font-medium text-gray-700">{page}</span> z <span className="font-medium text-gray-700">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Pierwsza strona"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                ← Poprzednia
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                Następna →
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Ostatnia strona"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <CreateTicketModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
