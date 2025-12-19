"use client"

import {useEffect, useState} from "react"
import type {Banco} from "@/types/banco"
import {X, Save, Plus} from "lucide-react"
import type React from "react"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";

interface AddBancoModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (banco: Banco) => void
    bancoSelecionado?: Banco | undefined;
}

export default function BancoModal({isOpen, onClose, onSave, bancoSelecionado}: AddBancoModalProps) {
    const [newBanco, setNewBanco] = useState<Banco>({
        id: -1,
        nome: '',
        codigo: '',
    });
    const isEditingBanco = bancoSelecionado !== undefined;

    useEffect(() => {
        bancoSelecionado && setNewBanco(bancoSelecionado)
    }, [bancoSelecionado])

    if (!isOpen) return null

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setNewBanco((prev) => ({...prev, [name.toLowerCase()]: value}))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(newBanco)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2'
                                  titulo={isEditingBanco ? 'Editar Banco' : 'Adicionar Novo Banco'}/>
                    <BotaoPadrao
                        onClick={onClose}
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
                            value={newBanco.nome}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type="text"
                            id="codigo"
                            name="Codigo"
                            value={newBanco.codigo}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <BotaoPadrao
                            variant='outline'
                            type='submit'
                            icon={isEditingBanco ? <Save className="h-5 w-5 mr-2"/> :
                                <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditingBanco ? 'Salvar Alterações' : 'Adicionar Banco'}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}