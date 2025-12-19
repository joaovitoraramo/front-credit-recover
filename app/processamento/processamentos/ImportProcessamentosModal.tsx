"use client"

import React, {useState, useRef, useEffect, useCallback} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput} from "@/components/ui/command"
import {Ban, Check, ChevronsUpDown, CircleArrowRight, Download, Upload, X} from "lucide-react"
import {cn} from "@/lib/utils"
import {searchClientes} from "@/lib/apiProcessamento"
import type {Client} from "@/types/client"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import InputItensCombobox from "@/components/Inputs/InputItensCombo";
import {lista} from "@/services/Cliente";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {useDropzone} from "react-dropzone";
import {importar} from "@/services/Importacao";
import {useToast} from "@/hooks/use-toast";
import {TipoAdquirente, TipoImportacao} from "@/types/tipoImportacao";
import SelectPadrao from "@/components/Inputs/SelectPadrao";

interface ImportProcessamentosModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCancel: () => void
}

export default function ImportProcessamentosModal({open, onOpenChange, onCancel}: ImportProcessamentosModalProps) {
    const [clienteSearch, setClienteSearch] = useState("")
    const [clientes, setClientes] = useState<Client[]>([])
    const [tipoImportacao, setTipoImportacao] = useState<TipoImportacao>('EXPRESS');
    const [tipoAdquirente, setTipoAdquirente] = useState<TipoAdquirente>('REDE');
    const [selectedCliente, setSelectedCliente] = useState<Client | null>(null)
    const [file, setFile] = useState<File | null>(null);
    const [selectedArquivoName, setSelectedArquivoName] = useState<string | null>(null);
    const [isPos, setIsPos] = useState<boolean>(false);
    const {toast} = useToast();

    useEffect(() => {
        setSelectedArquivoName(null)
        setSelectedCliente(null);
    }, [open]);

    const fetchClientes = useCallback(async (nome: string | null) => {
        const filtro = {
            "razaoSocial": nome,
        }
        const retorno = await lista(filtro);
        setClientes(retorno);
        return retorno;
    }, [])

    useEffect(() => {
        fetchClientes(clienteSearch)
    }, [clienteSearch])

    const handleFileChange = (id: string, file: File) => {
        if (id === "arquivo") {
            setFile(file);
            setSelectedArquivoName(file.name);
        }
    };

    const handleImport = async () => {
        if (selectedCliente && file) {
            const retorno = await importar(selectedCliente?.id, file, tipoImportacao, tipoAdquirente);
            if (retorno.status === 'OK') {
                toast({
                    title: 'Importação de vendas',
                    description: retorno.mensagem,
                    className: 'p-4 relative bg-[#808080] flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary',
                })
                onOpenChange(false)
            }
        }
    }

    const {getRootProps: getArquivoRootProps, getInputProps: getArquivoInputProps} = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles && acceptedFiles[0]) {
                handleFileChange('arquivo', acceptedFiles[0]);
            }
        },
    });

    const handleTipoImportacaoChange = (value: string | string[]) => {
        setIsPos(false);
        if (typeof value === "string") {
            if (value === "POS") {
                setIsPos(true);
            }
            setTipoImportacao(value as TipoImportacao);
        }
    }

    const handleTipoAdquirenteChange = (value: string | string[]) => {
        if (typeof value === "string") {
            setTipoAdquirente(value as TipoAdquirente);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Importar</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <InputItensCombobox
                        titulo={'Cliente'}
                        data={clientes}
                        search={clienteSearch}
                        setSearch={setClienteSearch}
                        setSelected={setSelectedCliente}
                        selectedItem={selectedCliente}
                        campoMostrar={'nomeFantasia'}
                        width={376}
                    />
                    <SelectPadrao
                        id="tipo"
                        name="tipo"
                        label="Tipo"
                        value={tipoImportacao}
                        onChange={handleTipoImportacaoChange}
                        options={[
                            {value: "EXPRESS", label: "SITEF EXPRESS"},
                            {value: "DTEF", label: "DTEF"},
                            {value: "TEFWEB", label: "TEF WEB"},
                            {value: "POS", label: "POS"},
                        ]}
                    />
                    {isPos && (
                        <SelectPadrao
                            id="adquirente"
                            name="adquirente"
                            label="Adquirente"
                            value={tipoAdquirente}
                            onChange={handleTipoAdquirenteChange}
                            options={[
                                {value: "CIELO", label: "CIELO"},
                                {value: "REDE", label: "REDE"},
                                {value: "STONE", label: "STONE"},
                                {value: "BIN", label: "BIN"},
                                {value: "GETNET", label: "GETNET"},
                                {value: "SAFRA", label: "SAFRA"},
                            ]}
                        />
                    )}
                    <div>
                        <label htmlFor="contratoLgpd" className="mb-2 block text-sm font-medium text-gray-700">
                            Arquivo
                        </label>
                        <div
                            {...getArquivoRootProps()}
                            className="border-2 border-dashed rounded-md p-4 cursor-pointer flex flex-col items-center justify-center hover:border-primary transition-colors"
                        >
                            <input {...getArquivoInputProps()} />
                            <p className="text-gray-500 text-sm">
                                Arraste e solte o arquivo aqui, ou clique para selecionar
                            </p>
                        </div>
                        {selectedArquivoName && (
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
                                        Arquivo selecionado: {selectedArquivoName}
                                    </p>
                                </div>
                                <BotaoPadrao
                                    onClick={() => {
                                        setSelectedArquivoName(null);
                                    }}
                                    variant="destructive"
                                    transparent
                                    icon={<X size={20}/>}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <BotaoPadrao
                        variant='outline'
                        onClick={onCancel}
                        name={'Cancelar'}
                        icon={<Ban className="w-4 h-4 font-bold"/>}
                    />
                    <BotaoPadrao
                        variant="outline"
                        onClick={handleImport}
                        name={'Importar'}
                        icon={<CircleArrowRight className="w-4 h-4 font-bold"/>}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

