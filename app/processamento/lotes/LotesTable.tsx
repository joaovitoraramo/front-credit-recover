"use client"

import {useState, useEffect} from "react"
import {
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import type React from "react"
import DataTablePadrao, {ISelectedRowsAction} from "@/components/Tabelas/DataTablePadrao";
import {parseISO, format} from "date-fns"
import {LoteReadDTO} from "@/types/lote";
import {Badge} from '@/components/ui/badge'
import {Activity, Archive, ArrowRightLeft, Coins, Layers, Move, RotateCw, TrendingUp, Undo} from "lucide-react";
import {useCheckPermission} from "@/hooks/useCheckPermission";
import {ExportColumn} from "@/types/export";


interface LotesTableProps {
    data: LoteReadDTO[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onFiltroAction: (filtro: any) => void
    onViewProcessamentosAction: (lote: LoteReadDTO) => void
    onBaixarAction: (lote: LoteReadDTO[]) => void
    onReverterBaixaAction: (lote: LoteReadDTO[]) => void
    onReprocessarTodasAction: (lote: LoteReadDTO[]) => void
    onTransferirAction: (lote: LoteReadDTO[]) => void
    onEncargosAction: (lote: LoteReadDTO[]) => void
    onExportColumnsChange?: (columns: ExportColumn<LoteReadDTO>[]) => void;
}

const columnHelper = createColumnHelper<LoteReadDTO>()


export default function LotesTable({
                                       data,
                                       pageCount,
                                       onPaginationChange,
                                       onFiltroAction,
                                       onViewProcessamentosAction,
                                       onBaixarAction,
                                       onReprocessarTodasAction,
                                       onReverterBaixaAction,
                                       onTransferirAction,
                                       onEncargosAction,
    onExportColumnsChange
                                   }: LotesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const columns: ColumnDef<LoteReadDTO>[] = [
        columnHelper.accessor("id", {
            header: "ID",
        }),
        columnHelper.accessor("clienteId", {
            header: "Cliente ID",
        }),
        columnHelper.accessor("clienteNomeFantasia", {
            header: "Cliente",
        }),
        columnHelper.accessor("bandeira.nome", {
            header: "Bandeira",
            cell: (info) => info.getValue(),
            meta: {
                buttonFilter: false,
            }
        }),
        columnHelper.accessor("dataPagamento", {
            header: "Data Pagamento",
            cell: (info) => {
                const date = parseISO(info.getValue());
                return format(date, "dd/MM/yyyy");
            },
        }),
        columnHelper.accessor("valorLiquido", {
            header: "Valor Líquido",
            meta: {
                buttonFilter: false,
            },
            cell: (info) => {
                const valorLiquido = info.getValue().toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                });
                const dataBaixa = info.row.original.dataBaixa;

                return (
                    <Badge className={dataBaixa ? 'bg-green-600' : 'bg-red-600'}>
                        {valorLiquido}
                    </Badge>
                );
            },
        }),
        columnHelper.accessor("valorTransacao", {
            header: "Valor Transação",
            meta: {
                buttonFilter: false,
            },
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
        }),
        columnHelper.accessor("banco.nome", {
            header: "Banco",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("valorTaxa", {
            header: "Valor Taxa",
            meta: {
                buttonFilter: false,
            },
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
        }),
        columnHelper.accessor("valorEncargos", {
            header: "Valor Encargos",
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
        }),
        columnHelper.accessor("taxa", {
            header: "Taxa",
            meta: {
                buttonFilter: false,
            },
            cell: (info) => (info.getValue() / 100).toLocaleString("pt-BR", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }),
        }),
        columnHelper.accessor("dataBaixa", {
            header: "Data da baixa",
            cell: (info) => {
                if (info.getValue() !== null) {
                    const date = parseISO(info.getValue() as string);
                    return format(date, "dd/MM/yyyy");
                }
                return null;
            },
        }),
        columnHelper.accessor("horaBaixa", {
            header: "Hora da baixa",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("usuarioBaixa", {
            header: "Baixado por",
            cell: (info) => info.getValue()?.nome,
        }),
    ] as ColumnDef<LoteReadDTO>[];

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const columnsToTotalize: { id: string; accessorKey: string }[] = [
        { id: 'valorTaxa', accessorKey: 'valorTaxa' },
        { id: 'valorEncargos', accessorKey: 'valorEncargos' },
        { id: 'valorLiquido', accessorKey: 'valorLiquido' },
        { id: 'valorTransacao', accessorKey: 'valorTransacao' },
    ];

    return (
        <div className="overflow-x-auto">
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onViewAction={onViewProcessamentosAction}
                onFiltroAction={onFiltroAction}
                canDelete={(row) => row.lancManual}
                modulo="lotes"
                canContextOpen
                selectedRowsAction={[
                    useCheckPermission(1044, false) && {
                        onClick: onReprocessarTodasAction,
                        icon: <RotateCw className='w-5 h-5'/>,
                        nome: 'Reprocessar todas as vendas do(s) lote(s)',
                    },
                    useCheckPermission(1040, false) && {
                        onClick: onBaixarAction,
                        icon: <Archive className='w-5 h-5'/>,
                        nome: 'Baixar lote(s) selecionado(s)',
                    },
                    useCheckPermission(1041, false) && {
                        onClick: onReverterBaixaAction,
                        icon: <Undo className='w-5 h-5'/>,
                        nome: 'Reverter baixa do(s) lote(s) selecionado(s)',
                    },
                    useCheckPermission(1042, false) && {
                        onClick: onTransferirAction,
                        icon: <ArrowRightLeft className='w-5 h-5'/>,
                        nome: 'Transferir lote(s) selecionado(s)',
                    },
                    useCheckPermission(1043, false) && {
                        onClick: onEncargosAction,
                        icon: <Layers className='w-5 h-5'/>,
                        nome: 'Encargos do lote',
                    }
                ].filter(Boolean) as ISelectedRowsAction[]}
                columnsToTotalize={columnsToTotalize}
                onExportColumnsChange={onExportColumnsChange}
            />
        </div>
    )
}

