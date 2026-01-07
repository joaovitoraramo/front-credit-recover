"use client";

import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";

import type {ProcessamentoFilter} from "@/types/processamento";
import type {Client} from "@/types/client";
import type {Bandeira} from "@/types/bandeira";

import {lista as listaClientes} from "@/services/Cliente";
import {lista as listaBandeiras} from "@/services/Bandeira";

interface ExportLotesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialFilter: ProcessamentoFilter;
    onConfirm: (filter: ProcessamentoFilter) => void;
    titulo: string;
}

export default function ModalExportar({
                                             open,
                                             onOpenChange,
                                             initialFilter,
                                             onConfirm,
                                          titulo
                                         }: ExportLotesModalProps) {
    const [filter, setFilter] = useState<ProcessamentoFilter>(initialFilter);

    const [clientes, setClientes] = useState<Client[]>([]);
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);

    const [clienteSearch, setClienteSearch] = useState("");
    const [bandeiraSearch, setBandeiraSearch] = useState("");

    const [selectedClientes, setSelectedClientes] = useState<Client[]>([]);
    const [selectedBandeiras, setSelectedBandeiras] = useState<Bandeira[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        listaClientes({ razaoSocial: clienteSearch }).then(setClientes);
    }, [clienteSearch]);

    useEffect(() => {
        listaBandeiras({ nome: bandeiraSearch }).then(setBandeiras);
    }, [bandeiraSearch]);

    useEffect(() => {
        setFilter(initialFilter);
    }, [initialFilter]);

    useEffect(() => {
        if (!open) return;

        let isMounted = true;

        const loadInitialData = async () => {
            setIsLoading(true);

            try {
                setFilter({ ...initialFilter });

                const promises: Promise<any>[] = [];

                if (initialFilter.clienteIds?.length) {
                    promises.push(
                        listaClientes(null).then((todos: Client[]) => {
                            const filtrados = todos.filter(c =>
                                initialFilter.clienteIds!.includes(c.id)
                            );

                            if (!isMounted) return;
                            setClientes(todos);
                            setSelectedClientes(filtrados);
                        })
                    );
                } else {
                    setSelectedClientes([]);
                }

                if (initialFilter.bandeiraIds?.length) {
                    promises.push(
                        listaBandeiras(null).then((todas: Bandeira[]) => {
                            const filtradas = todas.filter(b =>
                                initialFilter.bandeiraIds!.includes(b.id)
                            );

                            if (!isMounted) return;
                            setBandeiras(todas);
                            setSelectedBandeiras(filtradas);
                        })
                    );
                } else {
                    setSelectedBandeiras([]);
                }
                await Promise.all(promises);

            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [open, initialFilter]);

    const normalizeDate = (value?: string) => {
        if (!value) return "";
        return value.split("T")[0];
    };


    const handleConfirm = () => {
        onConfirm({
            ...filter,
            clienteIds: selectedClientes.map(c => c.id),
            bandeiraIds: selectedBandeiras.map(b => b.id),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Exportar {titulo}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            value={normalizeDate(filter.dataInicial) ?? ""}
                            onChange={e =>
                                setFilter(prev => ({ ...prev, dataInicial: e.target.value }))
                            }
                        />
                        <Input
                            type="date"
                            value={normalizeDate(filter.dataFinal) ?? ""}
                            onChange={e =>
                                setFilter(prev => ({ ...prev, dataFinal: e.target.value }))
                            }
                        />
                    </div>
                    <InputItensComboboxArray
                        titulo="Clientes"
                        data={clientes}
                        search={clienteSearch}
                        setSearch={setClienteSearch}
                        selectedItems={selectedClientes}
                        setSelected={setSelectedClientes}
                        campoMostrar="nomeFantasia"
                        width={500}
                    />
                    <InputItensComboboxArray
                        titulo="Bandeiras"
                        data={bandeiras}
                        search={bandeiraSearch}
                        setSearch={setBandeiraSearch}
                        selectedItems={selectedBandeiras}
                        setSelected={setSelectedBandeiras}
                        campoMostrar="nome"
                        width={500}
                    />
                    <div className="flex flex-col gap-2">
                        <CheckBoxPadrao
                            checked={filter.semBandeira ?? false}
                            onChange={value =>
                                setFilter(prev => ({ ...prev, semBandeira: value }))
                            }
                            label="Somente sem bandeira"
                        />

                        <CheckBoxPadrao
                            checked={filter.dataDePagamento ?? false}
                            onChange={value =>
                                setFilter(prev => ({ ...prev, dataDePagamento: value }))
                            }
                            label="Usar data de pagamento"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <BotaoPadrao
                            variant="ghost"
                            name="Cancelar"
                            onClick={() => onOpenChange(false)}
                        />
                        <BotaoPadrao
                            variant={'outline'}
                            name={isLoading ? "Carregando..." : "Gerar Arquivo"}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
