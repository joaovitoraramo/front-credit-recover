'use client';

import { Info, AlertTriangle, XCircle } from 'lucide-react';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';

interface IProps extends IMensagemPadraoProps {
    closable?: boolean;
    onClose?: () => void;
}

export interface IMensagemPadraoProps {
    tipo: 'aviso' | 'info' | 'erro';
    mensagem: string;
}

const alertVariants = {
    info: {
        icon: <Info className="h-8 w-8 mr-3" />,
        borderColor: 'border-blue-600',
        textColor: 'text-[#0069AF]',
        bgColor: 'bg-[#0069AF]/10',
        title: 'Informações:',
    },
    aviso: {
        icon: <AlertTriangle className="h-8 w-8 mr-3" />,
        borderColor: 'border-yellow-600',
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        title: 'Aviso:',
    },
    erro: {
        icon: <XCircle className="h-8 w-8 mr-3" />,
        borderColor: 'border-red-600',
        textColor: 'text-red-800',
        bgColor: 'bg-red-50',
        title: 'Erro:',
    },
};

export default function ({ tipo, mensagem, closable, onClose }: IProps) {
    const variant = alertVariants[tipo];

    if (!variant) {
        return null;
    }

    const { icon, borderColor, textColor, bgColor, title } = variant;

    return (
        <div
            className={`rounded-lg relative mb-4 p-4 flex items-center shadow-md transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10 ${bgColor} ${borderColor} ${textColor}`} // Added rounded corners and shadow
            role="alert"
        >
            {icon}
            <div className="flex-grow">
                <strong className="font-semibold mr-1">{title}</strong>
                <span className="block sm:inline">{mensagem}</span>
            </div>
            {closable && onClose && (
                <BotaoPadrao
                    variant="ghost"
                    onClick={onClose}
                    icon={<XCircle className="h-5 w-5" />}
                />
            )}
        </div>
    );
}
