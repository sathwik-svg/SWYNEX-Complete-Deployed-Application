import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X, RefreshCw } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onRetry?: () => void;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white ${
        isError ? 'border-rose-200 text-rose-950' : 'border-slate-200 text-slate-800'
      } transition-all duration-200`}
    >
      <div className="mt-0.5 shrink-0">
        {isError ? (
          <AlertCircle size={18} className="text-rose-600" />
        ) : (
          <CheckCircle2 size={18} className="text-emerald-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 mt-0.5 break-words">{toast.message}</p>}
        {toast.onRetry && (
          <button
            type="button"
            onClick={() => {
              onDismiss();
              toast.onRetry?.();
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2"
          >
            <RefreshCw size={12} />
            Retry Request
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
