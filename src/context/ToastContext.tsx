import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'celebrate';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (title: string, options?: { type?: ToastType; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  celebrate: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, options?: { type?: ToastType; message?: string; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const type = options?.type || 'success';
      const message = options?.message;
      const duration = options?.duration ?? 3500;

      const newToast: ToastMessage = { id, type, title, message, duration };
      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast(title, { type: 'success', message }), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, { type: 'info', message }), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, { type: 'warning', message }), [showToast]);
  const celebrate = useCallback((title: string, message?: string) => showToast(title, { type: 'celebrate', message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, info, warning, celebrate }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-4 sm:right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isCelebrate = toast.type === 'celebrate';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`pointer-events-auto rounded-2xl p-3.5 sm:p-4 shadow-xl border flex items-start space-x-3 backdrop-blur-md transition-all ${
                  isCelebrate
                    ? 'bg-[#FAF7F0]/95 text-[#2A2723] border-amber-300 ring-2 ring-amber-200/50 shadow-amber-900/10'
                    : isSuccess
                    ? 'bg-[#FAF7F0]/95 text-[#2A2723] border-emerald-300 ring-2 ring-emerald-200/50 shadow-emerald-900/10'
                    : isWarning
                    ? 'bg-[#FAF7F0]/95 text-[#2A2723] border-rose-300 ring-2 ring-rose-200/50 shadow-rose-900/10'
                    : 'bg-[#FAF7F0]/95 text-[#2A2723] border-[#D9D1C2] shadow-2xs'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCelebrate ? (
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                    </div>
                  ) : isSuccess ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </div>
                  ) : isWarning ? (
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-rose-700" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-[#EBE7DF] text-[#2A2723] flex items-center justify-center">
                      <Info className="w-4 h-4 text-[#6B6457]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-serif font-bold text-xs sm:text-sm text-[#2A2723] tracking-tight">
                    {toast.title}
                  </div>
                  {toast.message && (
                    <p className="text-[11px] sm:text-xs text-[#6B6457] font-sans mt-0.5 leading-snug">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-[#8C8475] hover:text-[#2A2723] hover:bg-[#EBE7DF] rounded-lg transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
