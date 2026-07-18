"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(32,33,36,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-full mx-4 shadow-xl border border-[var(--card-border)]" style={{ maxWidth: '400px', backgroundColor: 'var(--bg-primary, white)' }}>
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
              {options.title || "Confirm"}
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
              {options.message}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCancel} className="btn btn-secondary text-sm">
                {options.cancelText || "Cancel"}
              </button>
              <button 
                onClick={handleConfirm} 
                className={`btn text-sm ${options.danger ? "text-red-500 border border-red-500/30 hover:bg-red-50" : "btn-primary"}`}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
}
