'use client';

import { useToast } from '@/hooks/use-toast';

interface IProps {
    tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
    titulo: string;
    mensagem: string;
}

export default function ({ tipo, titulo, mensagem }: IProps) {
    const { toast } = useToast();

    let classNamePadrao =
        'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10';

    switch (tipo) {
        case 'info':
            classNamePadrao += 'border-blue-600 text-[#0069AF] bg-[#0069AF]/10';
            break;
    }

    toast({
        title: titulo,
        description: mensagem,
        className: classNamePadrao,
    });
}
