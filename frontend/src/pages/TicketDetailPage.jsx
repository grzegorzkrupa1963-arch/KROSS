import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, commentsApi, historyApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import Layout from '../components/common/Layout';
import useAuthStore from '../store/authStore';

function fmt(iso) {
  if (!iso) return '—';
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

function userInitial(u) {
  return (u?.first_name?.[0] ?? u?.email?.[0] ?? '?').toUpperCase();
}

const FIELD_LABELS = {
  status:      'Status',
  priority:    'Priorytet',
  category_id: 'Kategoria',
  assigned_to: 'Przypisano do',
  title:       'Tytuł',
  description: 'Opis',
};

/* ── sub-components ─────────────────────────────────────── */
function MetaGrid({ ticket }) {
  const rows = [
    { label: 'Kategoria',      value: ticket.category?.name ?? '—' },
    { label: 'Autor',          value: ticket.created_by ? `${userName(ticket.created_by)}${ticket.created_by.email ? ` (${ticket.created_by.email})` : ''}` : '—' },
    { label: 'Przypisano do',  value: userName(ticket.assigned_to) },
    { label: 'Utworzono',      value: fmt(ticket.created_at) },
    ...(ticket.resolved_at ? [{ label: 'Rozwiązano', value: fmt(ticket.resolved_at) }] : []),
  ];
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 divide-y divide-gray-100 sm:divide-y-0">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2.5 border-b border-gray-100 last:border-0 sm:border-b">
          <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-32 shrink-0 pt-0.5">{label}</dt>
          <dd className="text-sm text-gray-800">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CommentItem({ comment }) {
  const isInternal = comment.is_internal;
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5
        ${isInternal ? 'bg-amber-500' : 'bg-blue-500'}`}>
        {userInitial(comment.author)}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`rounded-xl rounded-tl-sm px-4 py-3 border
          ${isInternal
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-2">
            <span className="text-sm font-semibold text-gray-800">{userName(comment.author)}</span>
            {isInternal && (
              <span className="text-xs px-2 py-px bg-amber-200 text-amber-800 rounded-full font-medium">wewnętrzny</span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{fmt(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ entry, isLast }) {
  const label = FIELD_LABELS[entry.field_name] ?? entry.field_name;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-blue-200 border-2 border-blue-400 shrink-0 mt-1" />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{userName(entry.changed_by)}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{fmt(entry.changed_at)}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="text-gray-400 line-through text-xs">{entry.old_value ?? '—'}</span>
          <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium text-xs">{entry.new_value ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40 gap-2 text-gray-400 text-sm">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Ładowanie…
    </div>
  );
}

function ErrorMsg({ message }) {
  return (
    <div className="flex items-center justify-center h-40 text-red-500 text-sm gap-2">
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      {message}
    </div>
  );
}

/* ── main page ──────────────────────────────────────────── */
export default function TicketDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('comments');
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const isAgent     = currentUser?.role === 'agent' || currentUser?.role === 'admin';

  const ticketQ = useQuery({
    queryKey: ['ticket', id],
    queryFn:  () => ticketsApi.getOne(id).then((r) => r.data.ticket),
  });

  const commentsQ = useQuery({
    queryKey: ['ticket-comments', id],
    queryFn:  () => commentsApi.list(id).then((r) => r.data),
    enabled:  !!ticketQ.data,
  });

  const historyQ = useQuery({
    queryKey: ['ticket-history', id],
    queryFn:  () => historyApi.list(id).then((r) => r.data),
    enabled:  activeTab === 'history' && !!ticketQ.data,
  });

  const assignMutation = useMutation({
    mutationFn: () => ticketsApi.update(id, { assigned_to: currentUser.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-history', id] });
    },
  });

  const ticket = ticketQ.data;

  return (
    <Layout>
      {/* Powrót */}
      <button
        onClick={() => navigate('/tickets')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-5 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Powrót do listy
      </button>

      {ticketQ.isLoading && <Spinner />}
      {ticketQ.isError && (
        <ErrorMsg message={ticketQ.error?.response?.data?.error ?? 'Nie udało się załadować zgłoszenia'} />
      )}

      {ticket && (
        <div className="flex flex-col gap-5">

          {/* Karta nagłówkowa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Pasek kolorystyczny priorytetu */}
            <div className={`h-1 w-full ${
              ticket.priority === 'critical' ? 'bg-red-500' :
              ticket.priority === 'high'     ? 'bg-orange-400' :
              ticket.priority === 'medium'   ? 'bg-sky-400' : 'bg-slate-300'
            }`} />

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{ticket.title}</h1>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  {isAgent && ticket.assigned_to?.id !== currentUser?.id && (
                    <button
                      onClick={() => assignMutation.mutate()}
                      disabled={assignMutation.isPending}
                      className="text-xs px-3 py-1 rounded-full border border-blue-400 text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50 font-medium"
                    >
                      {assignMutation.isPending ? 'Przypisywanie…' : 'Przypisz do mnie'}
                    </button>
                  )}
                  {isAgent && ticket.assigned_to?.id === currentUser?.id && (
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                      Moje zgłoszenie
                    </span>
                  )}
                </div>
              </div>

              {ticket.description && (
                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>
              )}

              <MetaGrid ticket={ticket} />
            </div>
          </div>

          {/* Zakładki */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50/60">
              {[
                { key: 'comments', label: 'Komentarze',    count: commentsQ.data?.total },
                { key: 'history',  label: 'Historia zmian', count: historyQ.data?.total },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                    ${activeTab === tab.key
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/60'}`}
                >
                  {tab.label}
                  {tab.count != null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                      ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'comments' && (
                <>
                  {commentsQ.isLoading && <Spinner />}
                  {commentsQ.isError && <ErrorMsg message="Nie udało się załadować komentarzy" />}
                  {commentsQ.data?.data?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">Brak komentarzy</span>
                    </div>
                  )}
                  {commentsQ.data?.data?.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {commentsQ.data.data.map((c) => <CommentItem key={c.id} comment={c} />)}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <>
                  {historyQ.isLoading && <Spinner />}
                  {historyQ.isError && <ErrorMsg message="Nie udało się załadować historii" />}
                  {historyQ.data?.data?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Brak wpisów historii</span>
                    </div>
                  )}
                  {historyQ.data?.data?.length > 0 && (
                    <div className="pl-1">
                      {historyQ.data.data.map((e, i) => (
                        <HistoryItem
                          key={e.id}
                          entry={e}
                          isLast={i === historyQ.data.data.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
