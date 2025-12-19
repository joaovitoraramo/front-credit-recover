"use client"

import {useState, useEffect, useRef, useCallback} from "react"
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"

import {Ban, CircleArrowRight, Plus, Upload, X} from "lucide-react"
import {applyDateMask} from "@/lib/utils"
import {format, parse, isValid} from "date-fns"
import type {ProcessamentoFilter} from "@/types/processamento"
import type {Client} from "@/types/client"
import type {Bandeira} from "@/types/bandeira"
import {Input} from "@/components/ui/input"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputItensCombobox from "@/components/Inputs/InputItensCombo";
import {lista} from "@/services/Cliente";
import {lista as listaBandeiras} from '@/services/Bandeira'
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";
import {useCheckPermission} from "@/hooks/useCheckPermission";

interface FilterProcessamentosModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialFilter: ProcessamentoFilter
    onFilter: (filter: ProcessamentoFilter) => void
    onCancel: () => void
    onImportarAction: () => void
    onIncluirAction: () => void
    initialFilterDone: boolean,
}

export default function FilterProcessamentosModal({
                                                      open,
                                                      onOpenChange,
                                                      initialFilter,
                                                      onFilter,
                                                      onCancel,
                                                      onImportarAction,
                                                      onIncluirAction,
                                                      initialFilterDone
                                                  }: FilterProcessamentosModalProps) {
    const [filter, setFilter] = useState<ProcessamentoFilter>(initialFilter)
    const [clienteSearch, setClienteSearch] = useState("")
    const [bandeiraSearch, setBandeiraSearch] = useState("")
    const [clientes, setClientes] = useState<Client[]>([])
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([])
    const [selectedCliente, setSelectedCliente] = useState<Client | null>(null)
    const [selectedBandeiras, setSelectedBandeiras] = useState<Bandeira[]>([])
    const [dataInicialInput, setDataInicialInput] = useState("")
    const [dataFinalInput, setDataFinalInput] = useState("")
    const clienteInputRef = useRef<HTMLButtonElement>(null)
    const [semBandeira, setSemBandeira] = useState<boolean>(false);
    const dataFinalInputRef = useRef<HTMLInputElement>(null);
    const canImport = useCheckPermission(1039, false)
    const canInclude = useCheckPermission(1036, false)

    const fetchClientes = useCallback(async (nome: string | null) => {
        const filtro = {
            "razaoSocial": nome,
        }
        const retorno = await lista(filtro);
        setClientes(retorno);
        return retorno;
    }, [])

    const fetchBandeiras = useCallback(async (filtro: any | null) => {
        const retorno = await listaBandeiras(filtro);
        setBandeiras(retorno);
        return retorno;
    }, []);

    useEffect(() => {
        fetchClientes(clienteSearch)
    }, [clienteSearch])

    useEffect(() => {
        fetchBandeiras(bandeiraSearch)
    }, [bandeiraSearch])

    const handleFilter = () => {
        onFilter({
            ...filter,
            clienteIds: selectedCliente?.id ? [selectedCliente.id] : [],
            bandeiraIds: selectedBandeiras.map((b) => b.id),
            semBandeira
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
                const isoDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); // Convertendo para ISO 8601

                if (isInitial) {
                    setDataInicialInput(formattedDate);
                    setFilter((prev) => ({...prev, dataInicial: isoDate})); // Salvando ISO 8601
                } else {
                    setDataFinalInput(formattedDate);
                    setFilter((prev) => ({...prev, dataFinal: isoDate})); // Salvando ISO 8601
                }
            }
        } else if (cleanedValue.length === 8) {
            const date = parse(cleanedValue, "ddMMyyyy", new Date());
            if (isValid(date)) {
                const formattedDate = format(date, "dd/MM/yyyy");
                const isoDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); // Convertendo para ISO 8601

                if (isInitial) {
                    setDataInicialInput(formattedDate);
                    setFilter((prev) => ({...prev, dataInicial: isoDate})); // Salvando ISO 8601
                } else {
                    setDataFinalInput(formattedDate);
                    setFilter((prev) => ({...prev, dataFinal: isoDate})); // Salvando ISO 8601
                }
            }
        }
    };

    useEffect(() => {
        setBandeiraSearch('');
        setSelectedBandeiras([]);
    }, [semBandeira])


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[536px]">
                <DialogHeader>
                    <DialogTitle>Escopo de Pesquisa</DialogTitle>
                </DialogHeader>
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
                    <InputItensCombobox
                        titulo={'Cliente'}
                        data={clientes}
                        search={clienteSearch}
                        setSearch={setClienteSearch}
                        setSelected={setSelectedCliente}
                        selectedItem={selectedCliente}
                        campoMostrar={'nomeFantasia'}
                        ref={clienteInputRef}
                        width={376}
                    />
                    {!semBandeira && (
                        <InputItensComboboxArray
                            titulo={'Bandeiras'}
                            data={bandeiras}
                            search={bandeiraSearch}
                            setSearch={setBandeiraSearch}
                            setSelected={setSelectedBandeiras}
                            selectedItems={selectedBandeiras}
                            campoMostrar={'nome'}
                            width={376}
                        />
                    )}
                    <CheckBoxPadrao
                        label='Filtrar processamentos sem bandeira'
                        checked={semBandeira}
                        onChange={setSemBandeira}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    {!initialFilterDone && canImport && (
                        <BotaoPadrao
                            variant="outline"
                            onClick={onImportarAction}
                            name={'Importar'}
                            icon={<Upload className="w-4 h-4 font-bold"/>}
                        />
                    )}
                    {!initialFilterDone && canInclude && (
                        <BotaoPadrao
                            variant="outline"
                            onClick={onIncluirAction}
                            name={'Incluir'}
                            icon={<Plus className="w-4 h-4 font-bold"/>}
                        />
                    )}
                    <BotaoPadrao
                        variant="outline"
                        onClick={onCancel}
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

