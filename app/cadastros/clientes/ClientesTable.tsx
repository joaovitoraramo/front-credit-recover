"use client"

import React, {useState, useEffect} from "react"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import {Edit, ChevronLeft, ChevronRight} from "lucide-react"
import type {Client as Cliente} from "@/types/client"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import ClienteModal from "@/app/cadastros/clientes/ClienteModal";
import type {Contabilidade} from "@/types/contabilidade";
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import {useCheckPermission} from "@/hooks/useCheckPermission";

interface ClientsTableProps {
    data: Cliente[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (e: Cliente) => void
    onDeleteAction: (e: Cliente) => void
    onFiltroAction: (filtro: any) => void
}

const columnHelper = createColumnHelper<Cliente>()

const columns = [
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

