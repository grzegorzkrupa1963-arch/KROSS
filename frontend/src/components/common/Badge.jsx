const STATUS_CONFIG = {
  open:        { dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    label: 'Otwarte' },
  in_progress: { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'W toku' },
  resolved:    { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Rozwiązane' },
  closed:      { dot: 'bg-gray-400',    bg: 'bg-gray-100',   text: 'text-gray-500',    border: 'border-gray-200',    label: 'Zamknięte' },
};

const PRIORITY_CONFIG = {
  low:      { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200',  label: 'Niski' },
  medium:   { bg: 'bg-sky-50',     text: 'text-sky-700',    border: 'border-sky-200',    label: 'Średni' },
  high:     { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', label: 'Wysoki' },
  critical: { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    label: 'Krytyczny' },
};

export const PRIORITY_ROW_COLOR = {
  low:      'border-l-slate-300',
  medium:   'border-l-sky-400',
  high:     'border-l-orange-400',
  critical: 'border-l-red-500',
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: priority };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}
