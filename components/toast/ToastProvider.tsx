"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastType } from "./Toast";

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextData {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    function showToast(message: string, type: ToastType = "success") {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
    }

    function removeToast(id: string) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast deve estar dentro do ToastProvider");
    return ctx;
}
