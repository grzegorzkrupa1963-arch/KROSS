import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea({ label, error, id, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={4}
        {...props}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm resize-y
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
          ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Textarea;
