import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi, commentsApi, historyApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import Layout from '../components/common/Layout';

/* ── helpers ──────────────────────────────────────────── */
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

const FIELD_LABELS = {
  status:      'Status',
  priority:    'Priorytet',
  category_id: 'Kategoria',
  assigned_to: 'Przypisano do',
  title:       'Tytuł',
  description: 'Opis',
};

/* ── sub-components ───────────────────────────────────── */
function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500 sm:w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{children}</span>
    </div>
  );
}

function CommentItem({ comment }) {
  return (
    <div className={`rounded-xl p-4 ${comment.is_internal
      ? 'bg-amber-50 border border-amber-200'
      : 'bg-gray-50 border border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(comment.author?.first_name?.[0] ?? comment.author?.email?.[0] ?? '?').toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-800">{userName(comment.author)}</span>
          {comment.is_internal && (
            <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium">
              wewnętrzny
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{fmt(comment.created_at)}</span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}

function HistoryItem({ entry }) {
  const label = FIELD_LABELS[entry.field_name] ?? entry.field_name;
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <span className="text-xs text-gray-400">zmieniono przez</span>
          <span className="text-xs font-medium text-gray-600">{userName(entry.changed_by)}</span>
          <span className="text-xs text-gray-400">{fmt(entry.changed_at)}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="text-gray-400 line-through">{entry.old_value ?? '—'}</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-800 font-medium">{entry.new_value ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Ładowanie…
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex items-center justify-center h-64 text-red-500 text-sm">
      {message}
    </div>
  );
}

/* ── main page ────────────────────────────────────────── */
export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('comments');

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

  const ticket = ticketQ.data;

  return (
    <Layout>
      {/* Powrót */}
      <button
        onClick={() => navigate('/tickets')}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Powrót do listy
      </button>

      {ticketQ.isLoading && <LoadingState />}
      {ticketQ.isError && (
        <ErrorState message={ticketQ.error?.response?.data?.error ?? 'Nie udało się załadować zgłoszenia'} />
      )}

      {ticket && (
        <div className="flex flex-col gap-6">
          {/* Karta nagłówkowa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{ticket.title}</h1>
              <div className="flex gap-2 shrink-0">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            {ticket.description && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-6 leading-relaxed">
                {ticket.description}
              </p>
            )}

            <div className="divide-y divide-gray-100">
              <InfoRow label="Kategoria">
                {ticket.category?.name ?? <span className="text-gray-400">—</span>}
              </InfoRow>
              <InfoRow label="Autor">
                {userName(ticket.created_by)}
                {ticket.created_by?.email && (
                  <span className="text-gray-400 ml-1">({ticket.created_by.email})</span>
                )}
              </InfoRow>
              <InfoRow label="Przypisano do">
                {ticket.assigned_to ? userName(ticket.assigned_to) : <span className="text-gray-400">—</span>}
              </InfoRow>
              <InfoRow label="Data utworzenia">{fmt(ticket.created_at)}</InfoRow>
              {ticket.resolved_at && (
                <InfoRow label="Data rozwiązania">{fmt(ticket.resolved_at)}</InfoRow>
              )}
            </div>
          </div>

          {/* Zakładki */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'comments', label: 'Komentarze', count: commentsQ.data?.total },
                { key: 'history',  label: 'Historia zmian', count: historyQ.data?.total },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                    ${activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.label}
                  {tab.count != null && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
                      ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Zakładka: Komentarze */}
              {activeTab === 'comments' && (
                <>
                  {commentsQ.isLoading && <LoadingState />}
                  {commentsQ.isError && <ErrorState message="Nie udało się załadować komentarzy" />}
                  {commentsQ.data?.data?.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Brak komentarzy</p>
                  )}
                  {commentsQ.data?.data?.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {commentsQ.data.data.map((c) => <CommentItem key={c.id} comment={c} />)}
                    </div>
                  )}
                </>
              )}

              {/* Zakładka: Historia */}
              {activeTab === 'history' && (
                <>
                  {historyQ.isLoading && <LoadingState />}
                  {historyQ.isError && <ErrorState message="Nie udało się załadować historii" />}
                  {historyQ.data?.data?.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Brak wpisów historii</p>
                  )}
                  {historyQ.data?.data?.length > 0 && (
                    <div>
                      {historyQ.data.data.map((e) => <HistoryItem key={e.id} entry={e} />)}
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
