"use client";

import { Check, X, AlertCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Confirmations only. Anything the user has to act on belongs in the page, not
 * in a message that disappears.
 */
type Toast = { id: number; message: string; tone: "success" | "error" };

const ToastContext = createContext<((message: string, tone?: Toast["tone"]) => void) | null>(null);

const DISMISS_AFTER_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, DISMISS_AFTER_MS);
  }, []);

  const dismiss = (id: number) =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-32px)] max-w-[360px] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-[10px] border border-[#E4E4E7] bg-white px-3.5 py-3 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            {toast.tone === "success" ? (
              <Check size={16} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden="true" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" />
            )}
            <p className="flex-1 leading-5 text-[#18181B]">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="focus-ring -mr-1 rounded p-0.5 text-[#A1A1AA] transition hover:text-[#52525B]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider.");
  return context;
}
