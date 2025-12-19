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
} from "@/components/ui/alert-dialog"
import {useModalAvisoConfirmacao} from "@/context/ModalAvisoConfirmacaoContext";

export default function ModalAvisoConfirmacao() {
    const {isOpen, setIsOpen, titulo, descricao, setConfirmacao} = useModalAvisoConfirmacao();

    if (!isOpen) return;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{titulo}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {descricao}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmacao(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setConfirmacao(true)}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
