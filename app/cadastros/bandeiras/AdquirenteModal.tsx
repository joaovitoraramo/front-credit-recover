// app/cadastros/bandeiras/AdquirenteModal.tsx

"use client";

import {useEffect, useState} from "react";
import type {Adquirente} from "@/types/adquirente";
import {X, Plus} from "lucide-react";
import type React from "react";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import {cadastra} from "@/services/Adquirente"; // Importe os serviços de adquirente

interface AddAdquirenteModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSaveAction: (adquirente: Adquirente) => void;
    isEditingAdquirente?: boolean; // Adicione esta propriedade
    adquirenteEdit?: Adquirente | null; // Adicione esta propriedade
}

export default function AdquirenteModal({
                                            isOpen,
                                            onCloseAction,
                                            onSaveAction,
                                            isEditingAdquirente = false,
                                            adquirenteEdit = null,
                                        }: AddAdquirenteModalProps) {
    if (!isOpen) return null;
    const [newAdquirente, setNewAdquirente] = useState<Adquirente>({
        id: -1,
        nome: "",
        nomePlanilha: "",
    });

    useEffect(() => {
        if (adquirenteEdit) {
            setNewAdquirente(adquirenteEdit);
        } else if (!isEditingAdquirente) {
            setNewAdquirente({id: -1, nome: "", nomePlanilha: "", });
        }
    }, [adquirenteEdit, isEditingAdquirente]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewAdquirente((prev) => ({...prev, [name.toLowerCase()]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const createdAdquirente = await cadastra(newAdquirente);
        if (createdAdquirente) {
            onSaveAction(createdAdquirente);
            onCloseAction();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho="h2"
                        titulo={isEditingAdquirente ? "Editar Adquirente" : "Adicionar Novo Adquirente"}
                    />
                    <BotaoPadrao onClick={onCloseAction} variant="ghost" icon={<X size={24}/>} name="Fechar"/>
                </div>
                <div className="relative">
                    <InputPadrao
                        type="text"
                        id="nome"
                        name="Nome"
                        label="Nome"
                        value={newAdquirente.nome}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <BotaoPadrao
                        variant="outline"
                        onClick={handleSubmit}
                        icon={<Plus className="h-5 w-5 mr-2"/>}
                        name="Adicionar Adquirente"
                    />
                </div>
            </div>
        </div>
    );
}