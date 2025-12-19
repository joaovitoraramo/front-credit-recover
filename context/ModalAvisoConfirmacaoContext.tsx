"use client";

import React, {createContext, useState, useContext, ReactNode, SetStateAction, Dispatch} from 'react';

type TModalAvisoConfirmacaoContext = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    titulo: string;
    setTitulo: React.Dispatch<React.SetStateAction<string>>;
    descricao: string;
    setDescricao: React.Dispatch<React.SetStateAction<string>>;
    confirmacao: boolean | undefined;
    setConfirmacao: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const ModalAvisoConfirmacaoContext = createContext({} as TModalAvisoConfirmacaoContext);

export const ModalAvisoConfirmacaoProvider = ({children}: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [confirmacao, setConfirmacao] = useState<boolean | undefined>(undefined);

    return (
        <ModalAvisoConfirmacaoContext.Provider
            value={{isOpen, setIsOpen, titulo, setTitulo, descricao, setDescricao, confirmacao, setConfirmacao}}>
            {children}
        </ModalAvisoConfirmacaoContext.Provider>
    );
};

export const useModalAvisoConfirmacao = () => useContext(ModalAvisoConfirmacaoContext);