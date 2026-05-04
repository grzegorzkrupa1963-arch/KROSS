import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, categoriesApi } from '../../services/api';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const PRIORITIES = [
  { value: 'low',      label: 'Niski' },
  { value: 'medium',   label: 'Średni' },
  { value: 'high',     label: 'Wysoki' },
  { value: 'critical', label: 'Krytyczny' },
];

export default function CreateTicketModal({ onClose }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    defaultValues: { priority: 'medium' },
  });

  // Zamknięcie Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data) => ticketsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      onClose();
    },
    onError: (err) => {
      const body = err.response?.data;
      if (body?.errors) {
        body.errors.forEach(({ field, message }) => {
          if (field) setError(field, { message });
        });
      }
    },
  });

  function onSubmit(data) {
    mutation.mutate({
      title:       data.title.trim(),
      description: data.description.trim(),
      priority:    data.priority,
      ...(data.category_id && { category_id: data.category_id }),
    });
  }

  const categories = categoriesData?.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Nagłówek modala */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nowe zgłoszenie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-1
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Zamknij"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formularz */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4 px-6 py-5 overflow-y-auto"
        >
          <Input
            id="title"
            label="Tytuł *"
            placeholder="Krótki opis problemu"
            error={errors.title?.message}
            {...register('title', {
              required: 'Tytuł jest wymagany',
              maxLength: { value: 255, message: 'Maksymalnie 255 znaków' },
            })}
          />

          <Textarea
            id="description"
            label="Opis *"
            placeholder="Szczegółowy opis problemu, kroki do reprodukcji, oczekiwane zachowanie…"
            error={errors.description?.message}
            {...register('description', {
              required: 'Opis jest wymagany',
            })}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Priorytet */}
            <div className="flex flex-col gap-1">
              <label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Priorytet
              </label>
              <select
                id="priority"
                {...register('priority')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Kategoria */}
            <div className="flex flex-col gap-1">
              <label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                Kategoria
              </label>
              <select
                id="category_id"
                {...register('category_id')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— brak —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-red-600">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {/* Błąd ogólny */}
          {mutation.isError && !mutation.error?.response?.data?.errors && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {mutation.error?.response?.data?.error || 'Wystąpił błąd. Spróbuj ponownie.'}
            </div>
          )}

          {/* Przyciski */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Utwórz zgłoszenie
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
