'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {useModalAvisoConfirmacao} from '@/context/ModalAvisoConfirmacaoContext';
import {AlertTriangle} from 'lucide-react';

export default function ModalAvisoConfirmacao() {
    const { isOpen, setIsOpen, titulo, descricao, setConfirmacao } =
        useModalAvisoConfirmacao();

    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent
                className="
          max-w-md
          rounded-2xl
          border
          bg-white
          p-6
          shadow-2xl
        "
            >
                <AlertDialogHeader className="space-y-4">
                    {/* ÍCONE NEUTRO DE CONFIRMAÇÃO */}
                    <div
                        className="
              mx-auto
              flex h-14 w-14
              items-center justify-center
              rounded-full
              bg-primary/10
              text-primary
              shadow-inner
            "
                    >
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    {/* TÍTULO */}
                    <AlertDialogTitle
                        className="
              text-center
              text-lg
              font-semibold
              text-gray-900
            "
                    >
                        {titulo}
                    </AlertDialogTitle>

                    {/* DESCRIÇÃO */}
                    <AlertDialogDescription
                        className="
              text-center
              text-sm
              leading-relaxed
              text-gray-600
              whitespace-pre-line
            "
                    >
                        {descricao}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter
                    className="
            mt-6
            flex
            gap-3
          "
                >
                    {/* CANCELAR */}
                    <AlertDialogCancel
                        className="
              flex-1
              rounded-xl
              border
              bg-white
              text-gray-700
              hover:bg-gray-50
              transition
            "
                        onClick={() => {
                            setConfirmacao(false);
                            setIsOpen(false);
                        }}
                    >
                        Cancelar
                    </AlertDialogCancel>

                    {/* CONFIRMAR */}
                    <AlertDialogAction
                        className="
              flex-1
              rounded-xl
              bg-primary
              text-white
              hover:bg-primary/90
              shadow-md
              transition
            "
                        onClick={() => {
                            setConfirmacao(true);
                            setIsOpen(false);
                        }}
                    >
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
