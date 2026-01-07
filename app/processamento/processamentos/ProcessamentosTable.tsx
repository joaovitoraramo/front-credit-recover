"use client"

import {useState, useEffect} from "react"
import {
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import type {Processamento} from "@/types/processamento"
import type React from "react"
import {ViewProcessamentoModal} from "./ViewProcessamentoModal"
import DataTablePadrao, {ISelectedRowsAction} from "@/components/Tabelas/DataTablePadrao";
import {parseISO, format} from "date-fns"
import {Badge} from "@/components/ui/badge";
import {Archive, ArrowRightLeft, RotateCw, Undo} from "lucide-react";
import {ExportColumn} from "@/types/export";


interface ProcessamentosTableProps {
    data: Processamento[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (processamento: Processamento) => void,
    onDeleteProcessamento: (id: number) => void
    onFiltroAction: (filtro: any) => void
    onReprocessarAction: (processamentos: Processamento[]) => void,
    isFromLotes?: boolean;
    onBaixarAction?: (processamentos: Processamento[]) => void,
    onReverterBaixaAction?: (processamentos: Processamento[]) => void,
    disableFilter?: boolean
    onTransferirProcessamentoAction?: (processamento: Processamento[]) => void,
    onExportColumnsChange?: (columns: ExportColumn<Processamento>[]) => void;
}

const columnHelper = createColumnHelper<Processamento>()


export default function ProcessamentosTable({
                                                data,
                                                pageCount,
                                                onPaginationChange,
                                                onDeleteProcessamento,
                                                onFiltroAction,
                                                onEditAction,
                                                onReprocessarAction,
                                                isFromLotes,
                                                onBaixarAction,
                                                onReverterBaixaAction,
                                                onTransferirProcessamentoAction,
                                                disableFilter = false,
    onExportColumnsChange
                                            }: ProcessamentosTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [processamento, setProcessamento] = useState<Processamento | null>(null);

    const columns = [
        columnHelper.accessor("dataTransacao", {
            header: "Data Transação",
            cell: (info) => {
                const date = parseISO(info.getValue());
                return format(date, "dd/MM/yyyy");
            },
        }),
        columnHelper.accessor("horaTransacao", {
            header: "Hora Transação",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("dataPagamento", {
            header: "Data Pagamento",
            cell: (info) => {
                const date = parseISO(info.getValue());
                return format(date, "dd/MM/yyyy");
            },
        }),
        columnHelper.accessor("nsuHost", {
            header: "Identificação",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("cliente.nomeFantasia", {
            header: "Cliente",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("bin", {
            header: "Bin",
            cell: (info) => info.getValue(),
            meta: {
                buttonFilter: !disableFilter,
            }
        }),
        columnHelper.accessor("nomeProduto", {
            header: "Nome do Produto",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("descTransacao", {
            header: "Descrição Transação",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("rede", {
            header: "Rede",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("bandeira.nome", {
            header: "Bandeira",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("tipoProduto", {
            header: "Tipo",
            cell: (info) => (
                <Badge className={info.getValue() === 'D' ? 'bg-primary' : 'bg-gray-200 text-primary'}>
                    {info.getValue() === 'D' ? 'Débito' : 'Crédito'}
                </Badge>
            ),
        }),
        columnHelper.accessor("qtdeParcelas", {
            header: "Qtde Parcelas",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("parcela", {
            header: "Parcela",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("valorTotal", {
            header: "Valor Total",
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
            meta: {
                buttonFilter: !disableFilter,
            }
        }),
        columnHelper.accessor("valorParcela", {
            header: "Valor Parcela",
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
        }),
        columnHelper.accessor("taxa", {
            header: "Taxa",
            cell: (info) => (info.getValue() / 100).toLocaleString("pt-BR", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }),
        }),
        columnHelper.accessor("totalTaxa", {
            header: "Total Taxa",
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
        }),
        columnHelper.accessor("encargo", {
            header: "Total Encargos",
            cell: (info) => {
                let encargo = 0;
                encargo = info.getValue() ? info.getValue() : 0;
                return encargo.toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
            },
        }),
        columnHelper.accessor("valorLiquido", {
            header: "Valor Líquido",
            cell: (info) => info.getValue().toLocaleString("pt-BR", {style: "currency", currency: "BRL"}),
        }),
        columnHelper.accessor("dataBaixa", {
            header: "Data da baixa",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("horaBaixa", {
            header: "Hora da baixa",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("usuarioBaixa", {
            header: "Baixado por",
            cell: (info) => info.getValue()?.nome,
        }),
        columnHelper.accessor("lancManual", {
            header: "Lanç. Manual",
            cell: (info) => (
                <Badge className={info.getValue() ? 'bg-primary' : 'bg-gray-200 text-primary'}>
                    {info.getValue() ? 'Sim' : 'Não'}
                </Badge>
            ),
        }),
    ] as ColumnDef<Processamento>[];

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const selectedRowsActionFuction = (): ISelectedRowsAction[] => {
        let actions = [
            {
                nome: 'Reprocessar Venda(s)',
                onClick: onReprocessarAction,
                icon: <RotateCw className="w-5 h-5"/>
            }
        ]

        if (isFromLotes && onBaixarAction && onReverterBaixaAction && onTransferirProcessamentoAction) {
            actions.push(
                {
                    nome: 'Baixar processamento(s) selecionado(s)',
                    onClick: onBaixarAction,
                    icon: <Archive className="w-5 h-5"/>
                },
                {
                    nome: 'Reverter baixa do(s) processamento(s) selecionado(s)',
                    onClick: onReverterBaixaAction,
                    icon: <Undo className="w-5 h-5"/>
                },
                {
                    nome: 'Transferir processamento para outro lote',
                    onClick: onTransferirProcessamentoAction,
                    icon: <ArrowRightLeft className='w-5 h-5'/>
                }
            )
        }

        return actions
    }

    const selectedRowsAction = selectedRowsActionFuction();

    const columnsToTotalize: { id: string; accessorKey: string }[] = [
        { id: 'valorTotal', accessorKey: 'valorTotal' },
        { id: 'valorParcela', accessorKey: 'valorParcela' },
        { id: 'totalTaxa', accessorKey: 'totalTaxa' },
        { id: 'valorLiquido', accessorKey: 'valorLiquido' },
    ];

    return (
        <div className="overflow-x-auto">
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                canDelete={(row) => row.lancManual}
                onDeleteAction={(e) => onDeleteProcessamento(e.id)}
                modulo="processamentos"
                onViewAction={(e) => setProcessamento(e)}
                selectedRowsAction={selectedRowsAction}
                canContextOpen
                columnsToTotalize={columnsToTotalize}
                onExportColumnsChange={onExportColumnsChange}
            />
            <ViewProcessamentoModal
                processamento={processamento}
                isOpen={processamento != null}
                onClose={() => setProcessamento(null)}
                onEditAction={onEditAction}
            />
        </div>
    )
}

