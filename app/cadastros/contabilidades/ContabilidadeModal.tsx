"use client";

import {useState, useEffect} from "react";
import type {Contabilidade} from "@/types/contabilidade";
import {Plus, Save, X} from "lucide-react";
import React from "react";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";

interface AddContabilidadeModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSaveAction: (contabilidade: Contabilidade) => void;
    objetoSelecionado?: Contabilidade | undefined;
}

export default function ContabilidadeModal({
                                               isOpen,
                                               onCloseAction,
                                               onSaveAction,
                                               objetoSelecionado,
                                           }: AddContabilidadeModalProps) {
    const [newContabilidade, setNewContabilidade] = useState<Contabilidade>({
        id: -1,
        cnpj: "",
        razaoSocial: "",
        nomeFantasia: "",
        ie: "",
        email: "",
        ativo: true,
        dataCadastro: new Date().toISOString(),
    });
    const isEditing = objetoSelecionado !== undefined;

    useEffect(() => {
        if (objetoSelecionado) {
            setNewContabilidade(objetoSelecionado);
        }
    }, [objetoSelecionado]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setNewContabilidade((prev) => ({...prev, [id]: value}));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setNewContabilidade((prev) => ({...prev, ativo: checked}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveAction(newContabilidade);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho="h2"
                        titulo={isEditing ? "Editar Contabilidade" : "Adicionar Nova Contabilidade"}
                    />
                    <BotaoPadrao
                        onClick={onCloseAction}
                        variant="ghost"
                        icon={<X size={24}/>}
                        name="Fechar"
                    />
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputPadrao
                        type="text"
                        id="cnpj"
                        name="CNPJ"
                        value={newContabilidade.cnpj}
                        onChange={handleInputChange}
                        required
                    />
                    <InputPadrao
                        type="text"
                        id="razaoSocial"
                        name="Razão Social"
                        value={newContabilidade.razaoSocial}
                        onChange={handleInputChange}
                        required
                    />
                    <InputPadrao
                        type="text"
                        id="nomeFantasia"
                        name="Nome Fantasia"
                        value={newContabilidade.nomeFantasia}
                        onChange={handleInputChange}
                        required
                    />
                    <InputPadrao
                        type="text"
                        id="ie"
                        name="IE"
                        value={newContabilidade.ie}
                        onChange={handleInputChange}
                        required
                    />
                    <InputPadrao
                        type="email"
                        id="email"
                        name="Email"
                        value={newContabilidade.email}
                        onChange={handleInputChange}
                        required
                    />
                    {isEditing && (
                        <CheckBoxPadrao
                            label="Ativo"
                            checked={newContabilidade.ativo}
                            onChange={handleCheckboxChange}
                        />
                    )}
                    <div className="mt-6 flex justify-end">
                        <BotaoPadrao
                            variant="outline"
                            type="submit"
                            icon={isEditing ? <Save className="h-5 w-5 mr-2"/> : <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditing ? "Salvar Alterações" : "Adicionar Contabilidade"}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}