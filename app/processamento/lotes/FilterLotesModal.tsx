"use client"

import React, {useState, useEffect, useRef, useCallback} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Ban, CircleArrowRight} from "lucide-react"
import {applyDateMask} from "@/lib/utils"
import {format, parse, isValid} from "date-fns"
import type {ProcessamentoFilter} from "@/types/processamento"
import type {Client} from "@/types/client"
import type {Bandeira} from "@/types/bandeira"
import {Input} from "@/components/ui/input"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputItensCombobox from "@/components/Inputs/InputItensCombo";
import {lista} from "@/services/Cliente";
import {listaPorClienteTipo} from '@/services/Bandeira'
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";
import MensagemPadrao, {IMensagemPadraoProps} from "@/components/Util/MensagemPadrao";
import SelectPadrao from "@/components/Inputs/SelectPadrao";
import {parseDateStringDDMMYYYY} from "@/components/Util/utils";

interface FilterLotesModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialFilter: ProcessamentoFilter
    onFilter: (filter: ProcessamentoFilter) => void
    onCancelAction: () => void
    initialFilterDone: boolean,
}

export default function FilterLotesModal({
                                             open,
                                             onOpenChange,
                                             initialFilter,
                                             onFilter,
                                             onCancelAction,
                                             initialFilterDone
                                         }: FilterLotesModalProps) {
    const [filter, setFilter] = useState<ProcessamentoFilter>(initialFilter)
    const [clienteSearch, setClienteSearch] = useState("")
    const [bandeiraSearch, setBandeiraSearch] = useState("")
    const [clientes, setClientes] = useState<Client[]>([])
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([])
    const [selectedCliente, setSelectedCliente] = useState<Client[]>([])
    const [selectedBandeiras, setSelectedBandeiras] = useState<Bandeira[]>([])
    const [dataInicialInput, setDataInicialInput] = useState("")
    const [dataFinalInput, setDataFinalInput] = useState("")
    const clienteInputRef = useRef<HTMLButtonElement>(null)
    const dataFinalInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<IMensagemPadraoProps | null>(null);
    const [placeholderBandeira, setPlaceholderBandeira] = useState<string | undefined>('Selecione um cliente para filtrar as bandeiras');
    const [dataDePagamento, setDataDePagamento] = useState<boolean>(true);
    const [tipoLote, setTipoLote] = useState<string>('T');

    const fetchClientes = useCallback(async (nome: string | null) => {
        const filtro = {
            "razaoSocial": nome,
        }
        const retorno = await lista(filtro);
        setClientes(retorno);
        return retorno;
    }, [])

    const fetchBandeiras = useCallback(async (filtro: any | null) => {
        if (selectedCliente) {
            setPlaceholderBandeira(undefined)
            const retorno = await listaPorClienteTipo(filtro, selectedCliente[0].id);
            setBandeiras(retorno);
            return retorno;
        }
    }, [selectedCliente]);

    useEffect(() => {
        fetchClientes(clienteSearch)
    }, [clienteSearch])

    useEffect(() => {
        setMessage(null);
        fetchBandeiras(bandeiraSearch)
    }, [bandeiraSearch, selectedCliente])

    useEffect(() => {
        setFilter({
            ...filter,
            dataDePagamento
        })
    }, [dataDePagamento]);

    const validaDataFinalMenorQueDataInicial = () => {
        const dataInicial = parseDateStringDDMMYYYY(dataInicialInput)
        const dataFinal = parseDateStringDDMMYYYY(dataFinalInput)
        if (dataInicial && dataFinal) {
            if (dataFinal < dataInicial) {
                setMessage({
                    mensagem: 'A data final não pode ser menor que a data inicial.',
                    tipo: 'aviso'
                })
                return true;
            }
        }
        return false;
    }

    useEffect(() => {
        if (dataInicialInput != "" && dataFinalInput != "") {
            !validaDataFinalMenorQueDataInicial() && setMessage(null);
        }
    }, [dataInicialInput, dataFinalInput]);

    const handleFilter = () => {
        if (!selectedCliente) {
            setMessage({
                mensagem: 'Necessário selecionar um cliente para consulta.',
                tipo: 'aviso'
            })
            return;
        }
        if (!dataInicialInput || !dataFinalInput) {
            setMessage({
                mensagem: 'Data inicial e/ou data final não fornecidas.',
                tipo: 'aviso'
            })
            return;
        }
        !validaDataFinalMenorQueDataInicial() && onFilter({
            ...filter,
            clienteIds: selectedCliente.map(cliente => cliente.id),
            bandeiraIds: selectedBandeiras.map((b) => b.id),
            tipo: tipoLote,
        });
    };

    const handleDateInput = (value: string, isInitial: boolean) => {
        const cleanedValue = value.replace(/\D/g, "");
        if (cleanedValue.length <= 8) {
            const maskedValue = applyDateMask(cleanedValue);
            if (isInitial) {
                setDataInicialInput(maskedValue);
            } else {
                setDataFinalInput(maskedValue);
            }

            if (cleanedValue.length === 8) {
                const date = parse(cleanedValue, "ddMMyyyy", new Date());
                if (isValid(date)) {
                    const formattedDate = format(date, "yyyy-MM-dd");
                    setFilter((prev) => ({
                        ...prev,
                        [isInitial ? "dataInicial" : "dataFinal"]: formattedDate,
                    }));
                    if (isInitial && dataFinalInputRef.current) {
                        dataFinalInputRef.current.focus();
                    }
                }
            }
        }
    };

    const handleDateBlur = (value: string, isInitial: boolean) => {
        const cleanedValue = value.replace(/\D/g, "");
        if (cleanedValue.length === 4) {
            const currentYear = new Date().getFullYear();
            const fullDate = `${cleanedValue}${currentYear}`;
            const date = parse(fullDate, "ddMMyyyy", new Date());
            if (isValid(date)) {
                const formattedDate = format(date, "dd/MM/yyyy");
                const isoDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

                if (isInitial) {
                    setDataInicialInput(formattedDate);
                    setFilter((prev) => ({...prev, dataInicial: isoDate}));
                } else {

                    setDataFinalInput(formattedDate);
                    setFilter((prev) => ({...prev, dataFinal: isoDate}));
                }
            }
        } else if (cleanedValue.length === 8) {
            const date = parse(cleanedValue, "ddMMyyyy", new Date());
            if (isValid(date)) {
                const formattedDate = format(date, "dd/MM/yyyy");
                const isoDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

                if (isInitial) {
                    setDataInicialInput(formattedDate);
                    setFilter((prev) => ({...prev, dataInicial: isoDate}));
                } else {
                    setDataFinalInput(formattedDate);
                    setFilter((prev) => ({...prev, dataFinal: isoDate}));
                }
            }
        }
    };

    const handleTipoLote = (value: string | string[]) => {
        setTipoLote(value as string);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[536px]">
                <DialogHeader>
                    <DialogTitle>Escopo de Pesquisa</DialogTitle>
                </DialogHeader>
                {message && (
                    <MensagemPadrao
                        mensagem={message.mensagem}
                        tipo={message.tipo}
                    />
                )}
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Data Inicial</label>
                            <Input
                                value={dataInicialInput}
                                onChange={(e) => handleDateInput(e.target.value, true)}
                                onBlur={(e) => handleDateBlur(e.target.value, true)}
                                placeholder="DD/MM/AAAA"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Data Final</label>
                            <Input
                                value={dataFinalInput}
                                ref={dataFinalInputRef}
                                onChange={(e) => handleDateInput(e.target.value, false)}
                                onBlur={(e) => handleDateBlur(e.target.value, false)}
                                placeholder="DD/MM/AAAA"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleFilter();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <CheckBoxPadrao
                        label='Filtrar por data de pagamento'
                        checked={dataDePagamento}
                        onChange={(e) => setDataDePagamento(!dataDePagamento)}
                    />
                    <SelectPadrao
                        id="tipo"
                        name="tipo"
                        label="Tipo"
                        value={tipoLote}
                        onChange={handleTipoLote}
                        options={[
                            {value: "T", label: "Todos"},
                            {value: "A", label: "Pendentes"},
                            {value: "B", label: "Conciliado"},
                        ]}
                    />
                    <InputItensComboboxArray
                        titulo={'Clientes'}
                        tituloInput={'Cliente'}
                        data={clientes}
                        selectedItems={selectedCliente}
                        campoMostrar={'nomeFantasia'}
                        search={clienteSearch}
                        setSearch={setClienteSearch}
                        setSelected={setSelectedCliente}
                        width={376}
                    />
                    <InputItensComboboxArray
                        titulo={'Bandeiras'}
                        placeholder={placeholderBandeira}
                        data={bandeiras}
                        search={bandeiraSearch}
                        setSearch={setBandeiraSearch}
                        setSelected={setSelectedBandeiras}
                        selectedItems={selectedBandeiras}
                        campoMostrar={'nome'}
                        width={376}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <BotaoPadrao
                        variant="outline"
                        onClick={onCancelAction}
                        name={'Cancelar'}
                        icon={<Ban className="w-4 h-4 font-bold"/>}
                    />
                    <BotaoPadrao
                        variant="outline"
                        onClick={handleFilter}
                        name={'Ok'}
                        icon={<CircleArrowRight className="w-4 h-4 font-bold"/>}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

