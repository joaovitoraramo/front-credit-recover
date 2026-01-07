"use client"

import type React from "react"
import {useEffect, useState} from "react"
import type {Banco} from "@/types/banco"
import {Plus, Save, X} from "lucide-react"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import {useDropzone} from "react-dropzone";

interface AddBancoModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (banco: Banco) => void
    bancoSelecionado?: Banco | undefined;
}

export default function BancoModal({isOpen, onClose, onSave, bancoSelecionado}: AddBancoModalProps) {
    if (!isOpen) return null
    const [newBanco, setNewBanco] = useState<Banco>({
        id: -1,
        nome: '',
        codigo: '',
    });
    const isEditingBanco = bancoSelecionado !== undefined;
    const [selectedLogoName, setSelectedLogoName] = useState<string | null>(null);

    useEffect(() => {
        bancoSelecionado && setNewBanco(bancoSelecionado)
    }, [bancoSelecionado])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setNewBanco((prev) => ({...prev, [name.toLowerCase()]: value}))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(newBanco)
    }

    const handleFileChange = (id: string, file: File) => {
        if (id === "logo") {
            const reader = new FileReader();

            reader.onload = (event) => {
                const svgContent = event.target?.result as string;
                setNewBanco((prev) => ({...prev, [id]: svgContent}));
                setSelectedLogoName(file.name);
            };

            reader.readAsText(file);
        }
    };

    const {getRootProps: getLogoRootProps, getInputProps: getLogoInputProps} = useDropzone({
        accept: {
            'image/svg+xml': ['.svg'],
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles && acceptedFiles[0]) {
                handleFileChange('logo', acceptedFiles[0]);
            }
        },
    });

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
                    <div>
                        <label htmlFor="contratoSocial" className="mb-2 block text-sm font-medium text-gray-700">
                            Logo
                        </label>
                        <div
                            {...getLogoRootProps()}
                            className="border-2 border-dashed rounded-md p-4 cursor-pointer flex flex-col items-center justify-center hover:border-primary transition-colors"
                        >
                            <input {...getLogoInputProps()} />
                            <p className="text-gray-500 text-sm">
                                Arraste e solte o arquivo aqui, ou clique para selecionar
                            </p>
                        </div>
                        {selectedLogoName && (
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-green-500 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                        Arquivo selecionado: {selectedLogoName}
                                    </p>
                                </div>
                                <BotaoPadrao
                                    onClick={() => {
                                        setNewBanco((prev) => ({...prev, logo: undefined}));
                                        setSelectedLogoName(null);
                                    }}
                                    variant="destructive"
                                    transparent
                                    icon={<X size={20}/>}
                                />
                            </div>
                        )}
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