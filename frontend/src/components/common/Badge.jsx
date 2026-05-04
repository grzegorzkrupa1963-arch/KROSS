const STATUS_STYLES = {
  open:        'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved:    'bg-green-100 text-green-800',
  closed:      'bg-gray-100 text-gray-600',
};

const PRIORITY_STYLES = {
  low:      'bg-slate-100 text-slate-600',
  medium:   'bg-orange-100 text-orange-700',
  high:     'bg-red-100 text-red-700',
  critical: 'bg-red-600 text-white',
};

const STATUS_LABELS = {
  open: 'Otwarte', in_progress: 'W toku', resolved: 'Rozwiązane', closed: 'Zamknięte',
};
const PRIORITY_LABELS = {
  low: 'Niski', medium: 'Średni', high: 'Wysoki', critical: 'Krytyczny',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
