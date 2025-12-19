"use client"

import React, {useEffect, useState} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao"
import {CheckCircle, AlertTriangle, X, Plus, Check} from "lucide-react"
import {LoteReadDTO} from "@/types/lote"
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao"
import InputPadrao from "@/components/Inputs/InputPadrao"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import {ColumnDef, createColumnHelper, type PaginationState} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import {Encargo} from "@/types/encargo";

interface EncargosLoteModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lotes: LoteReadDTO[]
    onApplyEncargos: (lote: LoteReadDTO) => void
}

export default function EncargosLoteModal({
                                              open,
                                              onOpenChange,
                                              lotes,
                                              onApplyEncargos,
                                          }: EncargosLoteModalProps) {
    if (!lotes.length) return null;
    const [descricao, setDescricao] = useState("")
    const [valor, setValor] = useState("")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isPorcentagem, setIsPorcentagem] = useState(false)
    const [loteAlteracao, setLoteAlteracao] = useState<LoteReadDTO>();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [showAddEncargo, setShowAddEncargo] = useState(false);

    useEffect(() => {
        if (lotes && lotes.length > 0) {
            setLoteAlteracao(lotes[0]);
        }
    }, [lotes]);

    const columnHelper = createColumnHelper<Encargo>();

    const columns = [
        columnHelper.accessor("id", {
            header: "ID",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("descricaoEncargo", {
            header: "Descrição",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("valorEncargo", {
            header: "Valor",
            cell: (info) => {
                const valor = info.row.original.valorEncargo;
                const porPorcentagem = info.row.original.porPorcentagem;
                return porPorcentagem
                    ? `${valor.toFixed(2)}%`
                    : `R$ ${valor.toFixed(2)}`;
            },
        }),
        columnHelper.accessor("porPorcentagem", {
            header: "Por porcentagem",
            cell: (info) => (
                <Badge>
                    {info.getValue() ? 'Sim' : 'Não'}
                </Badge>
            ),
        }),
        columnHelper.accessor("mensal", {
            header: "Mensal",
            cell: (info) => (
                <Badge>
                    {info.getValue() ? 'Sim' : 'Não'}
                </Badge>
            ),
        }),
    ] as ColumnDef<Encargo>[];

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value.replace(',', '.');
        const formattedValue = inputValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const regex = /^\d{0,5}(\.\d{0,2})?$/;

        if (regex.test(formattedValue)) {
            if (formattedValue.includes('.')) {
                const parts = formattedValue.split('.');
                if (parts[1].length > 2) {
                    return;
                }
            }
            setValor(formattedValue);
        }
    };

    const handleAddEncargo = () => {
        if (!descricao || !valor) {
            setErrorMessage("Por favor, preencha todos os campos.")
            return
        }

        const newEncargo: Encargo = {
            id: 0,
            descricaoEncargo: descricao,
            valorEncargo: parseFloat(valor),
            porPorcentagem: isPorcentagem,
            mensal: false,
        };

        setLoteAlteracao((prevLote) => {
            if (prevLote) {
                return {
                    ...prevLote,
                    encargos: [...prevLote.encargos, newEncargo],
                };
            }
            return prevLote;
        });

        setDescricao("");
        setValor("");
        setIsPorcentagem(false);
        setErrorMessage(null);
        setShowAddEncargo(false);
    };

    const handleFinalizarEncargos = () => {
        if (loteAlteracao) {
            onApplyEncargos(loteAlteracao);
            onOpenChange(false);
        }
    };

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
    };

    const getPaginatedData = () => {
        if (loteAlteracao) {
            const start = pagination.pageIndex * pagination.pageSize;
            const end = start + pagination.pageSize;
            return loteAlteracao.encargos.slice(start, end);
        }
        return [];
    };

    const pageCount = Math.ceil(loteAlteracao ? loteAlteracao.encargos.length / pagination.pageSize : 0);

    const handleShowAddEncargo = () => {
        setShowAddEncargo(true);
    };

    const handleDeleteEncargo = (item: Encargo, index: number | undefined) => {
        setLoteAlteracao((prevLote) => {
            if (prevLote) {
                const updatedEncargos = prevLote.encargos.filter((_, i) => i !== index);
                return {
                    ...prevLote,
                    encargos: updatedEncargos,
                };
            }
            return prevLote;
        });
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Aplicar Encargos ao Lote</DialogTitle>
                    <DialogDescription>
                        Insira a descrição e o valor dos encargos a serem aplicados ao lote.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {lotes.length > 1 && (
                        <div className="bg-yellow-100 border border-yellow-400 rounded-md p-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2"/>
                            <p className="text-sm">
                                Apenas o primeiro lote selecionado será utilizado para aplicar os encargos.
                            </p>
                        </div>
                    )}
                    <DataTablePadrao
                        enableColumnHiding={false}
                        disableSelect
                        data={getPaginatedData()}
                        columns={columns}
                        pageCount={pageCount}
                        onPaginationChange={handlePaginationChange}
                        onDeleteAction={handleDeleteEncargo}
                        modulo="encargosLote"
                    />
                    {showAddEncargo && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-grow">
                                    <InputPadrao
                                        type="text"
                                        id="descricao"
                                        name="Descrição"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <InputPadrao
                                        type="text"
                                        id="valor"
                                        name="Valor"
                                        value={valor}
                                        onChange={handleValorChange}
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckBoxPadrao
                                        checked={isPorcentagem}
                                        onChange={() => setIsPorcentagem(!isPorcentagem)}
                                        label="Porcentagem"
                                    />
                                </div>
                                <div>
                                    <BotaoPadrao
                                        variant="outline"
                                        onClick={handleAddEncargo}
                                        name="Lançar"
                                        icon={<Check className={'w-5 h-5'}/>}
                                    />
                                </div>
                            </div>
                            {errorMessage && (
                                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <BotaoPadrao variant="outline" onClick={() => onOpenChange(false)} name="Cancelar"
                                 icon={<X className="w-5 h-5"/>}/>
                    <BotaoPadrao variant="outline" onClick={handleShowAddEncargo} name="Adicionar Encargo"
                                 icon={<Plus className="w-5 h-5"/>}/>
                    <BotaoPadrao variant="outline" onClick={handleFinalizarEncargos} name="Aplicar Encargos"
                                 icon={<CheckCircle className="w-4 h-4 font-bold"/>}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}