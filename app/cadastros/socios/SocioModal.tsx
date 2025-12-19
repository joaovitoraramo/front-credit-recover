"use client"

import {useState, useEffect, useCallback} from "react"
import type {Socio} from "@/types/socio"
import type {Client as Cliente} from "@/types/client"
import {Download, Plus, Save, X} from "lucide-react"
import type React from "react"
import TituloPadrao from "@/components/Titulos/TituloPadrao"
import InputPadrao from "@/components/Inputs/InputPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {lista} from "@/services/Cliente";
import {downloadArquivo} from "@/services/Socio";
import {useDropzone} from 'react-dropzone';
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";

interface AddSocioModalProps {
    isOpen: boolean
    onCloseAction: () => void
    onSaveAction: (socio: Socio) => void
    socioSelecionado?: Socio | undefined;
}

export default function SocioModal({isOpen, onCloseAction, onSaveAction, socioSelecionado}: AddSocioModalProps) {
    if (!isOpen) return null

    const [newSocio, setNewSocio] = useState<Socio>({
        id: -1,
        nome: '',
        cpf: '',
        contratoLgpd: undefined,
        contratoSocial: undefined,
        dataNascimento: '',
        documento: undefined,
        nomeMae: '',
        nomePai: '',
        rg: '',
        clientes: [],
    })
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [filteredClients, setFilteredClients] = useState<Cliente[]>([])
    const [clientSearch, setClientSearch] = useState("")
    const isEditingSocio = socioSelecionado !== undefined;
    const [selectedContratoSocialName, setSelectedContratoSocialName] = useState<string | null>(null);
    const [selectedDocumentoName, setSelectedDocumentoName] = useState<string | null>(null);
    const [selectedContratoLgpdName, setSelectedContratoLgpdName] = useState<string | null>(null);

    useEffect(() => {
        socioSelecionado && setNewSocio(socioSelecionado);
    }, [socioSelecionado])

    useEffect(() => {
        fetchClientes(null)
    }, [])

    const fetchClientes = useCallback(async (nome: string | null) => {
        const filtro = {
            "razaoSocial": nome,
        }
        const retorno = await lista(filtro);
        setClientes(retorno);
        return retorno;
    }, [])

    useEffect(() => {
        fetchClientes(clientSearch.toLowerCase()).then(e => {
            setFilteredClients(e);
        })
    }, [clientSearch])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value, id} = e.target
        setNewSocio((prev) => ({...prev, [id]: value}))
    }

    const handleClientSelect = (clientesSelecionados: Cliente[]) => {
        setNewSocio((prev) => ({
            ...prev,
            clientes: clientesSelecionados,
        }));
    };

    const handleClientDeselect = (cliente: Cliente) => {
        setNewSocio((prev) => ({
            ...prev,
            clientes: prev.clientes?.filter((c) => c.id !== cliente.id) || [],
        }))
    }

    const handleFileChange = (id: string, file: File) => {
        setNewSocio((prev) => ({...prev, [id]: file}));
        if (id === "contratoSocial") {
            setSelectedContratoSocialName(file.name);
        } else if (id === "documento") {
            setSelectedDocumentoName(file.name);
        } else if (id === "contratoLgpd") {
            setSelectedContratoLgpdName(file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSaveAction(newSocio)
    }

    const handleDownload = async (nome: string) => {
        if (socioSelecionado) {
            try {
                const response = await downloadArquivo(socioSelecionado.id, nome);
                if (response) {
                    const arrayBuffer = await response.arrayBuffer();
                    const blob = new Blob([arrayBuffer], {type: response.headers.get('content-type') ?? 'application/pdf'});
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${nome}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error('Erro ao baixar o arquivo:', error);
            }
        }
    };

    const {getRootProps: getContratoSocialRootProps, getInputProps: getContratoSocialInputProps} = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles && acceptedFiles[0]) {
                handleFileChange('contratoSocial', acceptedFiles[0]);
            }
        },
    });

    const {getRootProps: getDocumentoRootProps, getInputProps: getDocumentoInputProps} = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles && acceptedFiles[0]) {
                handleFileChange('documento', acceptedFiles[0]);
            }
        },
    });

    const {getRootProps: getContratoLgpdRootProps, getInputProps: getContratoLgpdInputProps} = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles && acceptedFiles[0]) {
                handleFileChange('contratoLgpd', acceptedFiles[0]);
            }
        },
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2' titulo={isEditingSocio ? 'Editar Sócio' : 'Adicionar Novo Sócio'}/>
                    <BotaoPadrao
                        onClick={onCloseAction}
                        variant='ghost'
                        icon={<X size={24}/>}
                        name='Fechar'
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputPadrao
                            type="text"
                            id="cpf"
                            name="CPF"
                            value={newSocio.cpf || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputPadrao
                            type="text"
                            id="nome"
                            name="Nome"
                            value={newSocio.nome || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputPadrao
                            type="text"
                            id="rg"
                            name="RG"
                            value={newSocio.rg || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputPadrao
                            type="date"
                            id="dataNascimento"
                            name="Data de Nascimento"
                            value={newSocio.dataNascimento || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputPadrao
                            type="text"
                            id="nomePai"
                            name="Nome do Pai"
                            value={newSocio.nomePai || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputPadrao
                            type="text"
                            id="nomeMae"
                            name="Nome da Mãe"
                            value={newSocio.nomeMae || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-span-2">
                        <InputItensComboboxArray
                            titulo={'Clientes'}
                            data={clientes}
                            selectedItems={newSocio.clientes}
                            campoMostrar={'nomeFantasia'}
                            search={clientSearch}
                            setSearch={setClientSearch}
                            setSelected={handleClientSelect}
                            width={300}
                        />
                    </div>
                    <div>
                        <label htmlFor="contratoSocial" className="mb-2 block text-sm font-medium text-gray-700">
                            Contrato Social
                        </label>
                        <div
                            {...getContratoSocialRootProps()}
                            className="border-2 border-dashed rounded-md p-4 cursor-pointer flex flex-col items-center justify-center hover:border-primary transition-colors"
                        >
                            <input {...getContratoSocialInputProps()} />
                            <p className="text-gray-500 text-sm">
                                Arraste e solte o arquivo aqui, ou clique para selecionar
                            </p>
                        </div>
                        {selectedContratoSocialName && (
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
                                        Arquivo selecionado: {selectedContratoSocialName}
                                    </p>
                                </div>
                                <BotaoPadrao
                                    onClick={() => {
                                        setNewSocio((prev) => ({...prev, contratoSocial: undefined}));
                                        setSelectedContratoSocialName(null);
                                    }}
                                    variant="destructive"
                                    transparent
                                    icon={<X size={20}/>}
                                />
                            </div>
                        )}
                        {isEditingSocio && (
                            <div className="mt-2">
                                <BotaoPadrao
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDownload("contrato-social");
                                    }}
                                    variant="ghost"
                                    icon={<Download size={20}/>}
                                    name='Download'
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="documento" className="mb-2 block text-sm font-medium text-gray-700">
                            Documento
                        </label>
                        <div
                            {...getDocumentoRootProps()}
                            className="border-2 border-dashed rounded-md p-4 cursor-pointer flex flex-col items-center justify-center hover:border-primary transition-colors"
                        >
                            <input {...getDocumentoInputProps()} />
                            <p className="text-gray-500 text-sm">
                                Arraste e solte o arquivo aqui, ou clique para selecionar
                            </p>
                        </div>
                        {selectedDocumentoName && (
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
                                        Arquivo selecionado: {selectedDocumentoName}
                                    </p>
                                </div>
                                <BotaoPadrao
                                    onClick={() => {
                                        setNewSocio((prev) => ({...prev, documento: undefined}));
                                        setSelectedDocumentoName(null);
                                    }}
                                    variant="destructive"
                                    transparent
                                    icon={<X size={20}/>}
                                />
                            </div>
                        )}
                        {isEditingSocio && (
                            <div className="mt-2">
                                <BotaoPadrao
                                    onClick={() => handleDownload("documento")}
                                    variant="ghost"
                                    icon={<Download size={20}/>}
                                    name='Download'
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="contratoLgpd" className="mb-2 block text-sm font-medium text-gray-700">
                            Contrato LGPD
                        </label>
                        <div
                            {...getContratoLgpdRootProps()}
                            className="border-2 border-dashed rounded-md p-4 cursor-pointer flex flex-col items-center justify-center hover:border-primary transition-colors"
                        >
                            <input {...getContratoLgpdInputProps()} />
                            <p className="text-gray-500 text-sm">
                                Arraste e solte o arquivo aqui, ou clique para selecionar
                            </p>
                        </div>
                        {selectedContratoLgpdName && (
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
                                        Arquivo selecionado: {selectedContratoLgpdName}
                                    </p>
                                </div>
                                <BotaoPadrao
                                    onClick={() => {
                                        setNewSocio((prev) => ({...prev, contratoLgpd: undefined}));
                                        setSelectedContratoLgpdName(null);
                                    }}
                                    variant="destructive"
                                    transparent
                                    icon={<X size={20}/>}
                                />
                            </div>
                        )}
                        {isEditingSocio && (
                            <div className="mt-2">
                                <BotaoPadrao
                                    onClick={() => handleDownload("contratoLgpd")}
                                    variant="ghost"
                                    icon={<Download size={20}/>}
                                    name='Download'
                                />
                            </div>
                        )}
                    </div>
                    <div className="col-span-2 mt-4 flex justify-end">
                        <BotaoPadrao
                            variant='outline'
                            onClick={handleSubmit}
                            icon={isEditingSocio ? <Save className="h-5 w-5 mr-2"/> :
                                <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditingSocio ? 'Salvar Alterações' : 'Adicionar Sócio'}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

