"use client";

import {useState, useEffect} from "react";
import type {Bandeira, TModalidade} from "@/types/bandeira";
import {List, Plus, Save, X} from "lucide-react";
import React from "react";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import SelectPadrao from "@/components/Inputs/SelectPadrao";
import BinsModal from "@/app/cadastros/bandeiras/BinsModal";
import {useDropzone} from "react-dropzone";

interface AddBandeiraModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSaveAction: (bandeira: Bandeira) => void;
    objetoSelecionado?: Bandeira | undefined;
}

export default function BandeiraModal({
                                          isOpen,
                                          onCloseAction,
                                          onSaveAction,
                                          objetoSelecionado
                                      }: AddBandeiraModalProps) {
    if (!isOpen) return null;

    const [managingBinsBandeira, setManagingBinsBandeira] = useState<Bandeira | null>(null);
    const [selectedLogoName, setSelectedLogoName] = useState<string | null>(null);

    const [newBandeira, setNewBandeira] = useState<Bandeira>({
        id: -1,
        bins: [],
        nome: "",
        tipo: "C",
        tipoAdicional: 'AV'
    });
    const isEditing = objetoSelecionado !== undefined;

    useEffect(() => {
        if (objetoSelecionado) {
            setNewBandeira(objetoSelecionado);
        }
    }, [objetoSelecionado]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewBandeira((prev) => ({...prev, [name]: value}));
    };

    const handleSelectChange = (value: string | string[]) => {
        if (typeof value === "string") {
            if (value === "C" || value === "D") {
                setNewBandeira((prev) => ({...prev, tipo: value}));
            }
        }
    };

    const handleTipoAdicionalChange = (value: string | string[]) => {
        setNewBandeira((prev) => ({...prev, tipoAdicional: value as TModalidade}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveAction(newBandeira as Bandeira);
    };

    const handleSaveBins = (updatedBandeira: Bandeira) => {
        onSaveAction(updatedBandeira);
        setManagingBinsBandeira(null);
    };

    const handleOpenBinsModal = () => {
        setManagingBinsBandeira(newBandeira);
    };

    const handleFileChange = (id: string, file: File) => {
        if (id === "logo") {
            const reader = new FileReader();

            reader.onload = (event) => {
                const svgContent = event.target?.result as string;
                setNewBandeira((prev) => ({...prev, [id]: svgContent}));
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
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho="h2"
                        titulo={isEditing ? "Editar Bandeira" : "Adicionar Nova Bandeira"}
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
                        id="nome"
                        name="nome"
                        label="Nome"
                        value={newBandeira.nome}
                        onChange={handleInputChange}
                        required
                    />
                    <SelectPadrao
                        id="tipo"
                        name="tipo"
                        label="Tipo"
                        value={newBandeira.tipo}
                        onChange={handleSelectChange}
                        options={[
                            {value: "C", label: "Crédito"},
                            {value: "D", label: "Débito"},
                        ]}
                    />
                    <SelectPadrao
                        id="tipoAdicional"
                        name="tipoAdicional"
                        label="Modalidade"
                        value={newBandeira.tipoAdicional}
                        onChange={handleTipoAdicionalChange}
                        options={[
                            {value: "AV", label: "A vista"},
                            {value: "PP", label: "Pré pago"},
                            {value: "VC", label: "Voucher"},
                            {value: "CD", label: "Carteira digital"},
                            {value: "PX", label: "Pix"},
                        ]}
                    />
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
                                        setNewBandeira((prev) => ({...prev, logo: undefined}));
                                        setSelectedLogoName(null);
                                    }}
                                    variant="destructive"
                                    transparent
                                    icon={<X size={20}/>}
                                />
                            </div>
                        )}
                    </div>
                    <BinsModal
                        bandeira={managingBinsBandeira}
                        isOpen={!!managingBinsBandeira}
                        onCloseAction={() => setManagingBinsBandeira(null)}
                        onSaveAction={handleSaveBins}
                    />
                    <div className="mt-6 flex justify-end">
                        <BotaoPadrao
                            variant="outline"
                            type="button"
                            icon={<List className="h-5 w-5 mr-2"/>}
                            name="Gerenciar Bins"
                            onClick={handleOpenBinsModal}
                        />
                        <BotaoPadrao
                            variant="outline"
                            type="submit"
                            icon={isEditing ? <Save className="h-5 w-5 ml-2"/> : <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditing ? "Salvar Alterações" : "Adicionar Bandeira"}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}