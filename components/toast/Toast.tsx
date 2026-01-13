"use client";

import { X, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    onClose: (id: string) => void;
}

const toastStyles = {
    success: {
        bg: "bg-[#1F6F6B]",
        icon: <CheckCircle size={18} />,
    },
    error: {
        bg: "bg-red-600",
        icon: <XCircle size={18} />,
    },
    warning: {
        bg: "bg-yellow-500",
        icon: <AlertTriangle size={18} />,
    },
};

export function Toast({ id, message, type = "success", onClose }: ToastProps) {
    const [closing, setClosing] = useState(false);
    const style = toastStyles[type];

    // ⏱️ tempo visível antes de sair
    useEffect(() => {
        const timer = setTimeout(() => {
            setClosing(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // ⏱️ aguarda animação antes de remover
    useEffect(() => {
        if (!closing) return;

        const timer = setTimeout(() => {
            onClose(id);
        }, 300);

        return () => clearTimeout(timer);
    }, [closing, id, onClose]);

    return (
        <div
            className={`
        relative
        w-full
        max-w-sm
        ${style.bg}
        text-white
        px-4
        py-3
        rounded-xl
        shadow-xl
        flex
        items-center
        justify-between
        gap-4
        ${closing ? "toast-exit" : "toast-enter"}
      `}
        >
            <div className="flex items-center gap-3">
                {style.icon}
                <span className="text-sm">{message}</span>
            </div>

            <button
                onClick={() => setClosing(true)}
                className="text-white/80 hover:text-white transition"
            >
                <X size={16} />
            </button>
        </div>
    );
}
