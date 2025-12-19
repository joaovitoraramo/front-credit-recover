'use client';

import { Info, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner'; // Or your preferred toast library
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';

interface IMensagemPadraoProps {
    tipo: 'aviso' | 'info' | 'erro';
    mensagem: string;
}

const alertVariants = {
    info: {
        icon: <Info className="h-6 w-6 mr-3" />,
        borderColor: 'border-blue-600',
        textColor: 'text-[#0069AF]',
        bgColor: 'bg-[#0069AF]/10',
        title: 'Informações:',
    },
    aviso: {
        icon: <AlertTriangle className="h-6 w-6 mr-3" />,
        borderColor: 'border-yellow-600',
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        title: 'Aviso:',
    },
    erro: {
        icon: <XCircle className="h-6 w-6 mr-3" />,
        borderColor: 'border-red-600',
        textColor: 'text-red-800',
        bgColor: 'bg-red-50',
        title: 'Erro:',
    },
};

export default function ({ tipo, mensagem }: IMensagemPadraoProps) {
    const variant = alertVariants[tipo];

    if (!variant) {
        return null;
    }

    const { icon, borderColor, textColor, bgColor, title } = variant;

    toast(
        <div
            className={`rounded-lg p-4 flex items-center shadow-md ${bgColor} ${borderColor} ${textColor}`}
            role="alert"
        >
            {icon}
            <div className="flex-grow">
                <strong className="font-semibold mr-1">{title}</strong>
                <span className="block sm:inline">{mensagem}</span>
            </div>
        </div>,
        {
            position: 'bottom-right', // Position in the bottom right
            duration: 5000, // Adjust duration as needed
            style: {
                // Custom styles for the toast
                background: 'white', // Ensure background is white for transparency to work
                borderRadius: '0.5rem', // Match rounded-lg
                padding: '1rem', // Match p-4
                boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)', // Match shadow-md
                border: 'none', // Remove default toast border
                transform: 'translateX(100%)', // Start off-screen to the right
                transition: 'transform 0.3s ease-in-out', // Smooth transition
            },
            className: 'animate-slide-in', // Animation class
        },
    );

    return null; // This component doesn't render anything directly
}

// Add animation to global CSS (e.g., globals.css or similar)
/*
@keyframes slide-in {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.animate-slide-in {
    animation: slide-in 0.3s ease-in-out forwards;
}
*/
