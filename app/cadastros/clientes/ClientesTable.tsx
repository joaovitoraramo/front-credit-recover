"use client"

import React, {useEffect, useState} from "react"
import {ColumnDef, createColumnHelper, type PaginationState,} from "@tanstack/react-table"
import type {Client as Cliente, StatusCliente} from "@/types/client"
import ClienteModal from "@/app/cadastros/clientes/ClienteModal";
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import {useCheckPermission} from "@/hooks/useCheckPermission";
import {CheckCircle, LucideIcon, PauseCircle, Wrench, XCircle} from "lucide-react";
import {Badge} from '@/components/ui/badge';

interface ClientsTableProps {
    data: Cliente[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (e: Cliente) => void
    onDeleteAction: (e: Cliente) => void
    onFiltroAction: (filtro: any) => void
}

const columnHelper = createColumnHelper<Cliente>()

const statusConfig: Record<
    StatusCliente,
    {
        label: string;
        icon: LucideIcon;
        className: string;
    }
> = {
    ATIVO: {
        label: "Ativo",
        icon: CheckCircle,
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    INATIVO: {
        label: "Inativo",
        icon: PauseCircle,
        className: "bg-slate-100 text-slate-700 border border-slate-200",
    },
    IMPLANTACAO: {
        label: "Implantação",
        icon: Wrench,
        className: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    CANCELADO: {
        label: "Cancelado",
        icon: XCircle,
        className: "bg-red-50 text-red-700 border border-red-200",
    },

};


const columns = [
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
            const status = info.getValue() as StatusCliente;

            const { label, icon: Icon, className } = statusConfig[status];

            return (
                <Badge
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${className}`}
                >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                </Badge>
            );
        },
    }),
    columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("cnpj", {
        header: "CNPJ",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("razaoSocial", {
        header: "Razão Social",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("nomeFantasia", {
        header: "Nome Fantasia",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("celular", {
        header: "Celular",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("pdvs", {
        header: "PDVs",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("pos", {
        header: "POS",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("erp", {
        header: "ERP",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("tef", {
        header: "TEF",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("contabilidade", {
        header: "Contabilidade",
        cell: (info) => info.getValue()?.nomeFantasia || "Não vinculada",
        meta: {
            buttonFilter: true
        }
    }),
] as ColumnDef<Cliente>[];

export default function ClientesTable({
                                          data,
                                          pageCount,
                                          onPaginationChange,
                                          onEditAction,
                                          onFiltroAction,
                                          onDeleteAction
                                      }: ClientsTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editingClient, setEditingClient] = useState<Cliente | undefined>(undefined)

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const handleSaveEdit = (editedClient: Cliente) => {
        onEditAction(editedClient)
        setEditingClient(undefined)
    }

    return (
        <div className="overflow-x-auto">
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                modulo='contabilidade'
                onEditAction={useCheckPermission(1034, false) ? (e) => setEditingClient(e) : undefined}
                onDeleteAction={useCheckPermission(1035, false) ? onDeleteAction : undefined}
            />
            <ClienteModal
                isOpen={!!editingClient}
                onCloseAction={() => setEditingClient(undefined)}
                onSaveAction={handleSaveEdit}
                clienteSelecionado={editingClient}
            />
        </div>
    )
}

