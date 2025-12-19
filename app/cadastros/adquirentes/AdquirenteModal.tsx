"use client"

import {useEffect, useState} from "react"
import type {Adquirente} from "@/types/adquirente"
import {X, Save, Plus} from "lucide-react"
import type React from "react"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";

interface AddAdquirenteModalProps {
    isOpen: boolean
    onCloseAction: () => void
    onSaveAction: (adquirente: Adquirente) => void
    adquirenteSelecionado?: Adquirente | undefined;
}

export default function AdquirenteModal({
                                            isOpen,
                                            onCloseAction,
                                            onSaveAction,
                                            adquirenteSelecionado
                                        }: AddAdquirenteModalProps) {
    const [newAdquirente, setNewAdquirente] = useState<Adquirente>({
        id: -1,
        nome: '',
        nomePlanilha: '',
    });
    const isEditingAdquirente = adquirenteSelecionado !== undefined;

    useEffect(() => {
        adquirenteSelecionado && setNewAdquirente(adquirenteSelecionado)
    }, [adquirenteSelecionado])

    if (!isOpen) return null

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setNewAdquirente((prev) => ({...prev, [name]: value}))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSaveAction(newAdquirente)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2'
                                  titulo={isEditingAdquirente ? 'Editar Adquirente' : 'Adicionar Novo Adquirente'}/>
                    <BotaoPadrao
                        onClick={onCloseAction}
                        variant='ghost'
                        icon={<X size={24}/>}
                        name='Fechar'
                    />
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <InputPadrao
                            type="text"
                            id="nome"
                            name="Nome"
                            value={newAdquirente.nome}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type="text"
                            label='Nome na Planilha'
                            id="nomePlanilha"
                            name="nomePlanilha"
                            value={newAdquirente.nomePlanilha}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <BotaoPadrao
                            variant='outline'
                            type='submit'
                            icon={isEditingAdquirente ? <Save className="h-5 w-5 mr-2"/> :
                                <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditingAdquirente ? 'Salvar Alterações' : 'Adicionar Adquirente'}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}