"use client"

import {useState, useEffect} from "react"
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import type {Socio} from "@/types/socio"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import SocioModal from "./SocioModal";
import {useCheckPermission} from "@/hooks/useCheckPermission";

interface SociosTableProps {
    data: Socio[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (socio: Socio) => void
    onFiltroAction: (filtro: any) => void
    onDeleteAction: (socio: Socio) => void
}

const columnHelper = createColumnHelper<Socio>()

const columns = [
    columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("cpf", {
        header: "CPF",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true,
        }
    }),
    columnHelper.accessor("nome", {
        header: "Nome",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true,
        }
    }),
    columnHelper.accessor("rg", {
        header: "RG",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("dataNascimento", {
        header: "Data de Nascimento",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("nomePai", {
        header: "Nome do Pai",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("nomeMae", {
        header: "Nome da Mãe",
        cell: (info) => info.getValue(),
    }),
] as ColumnDef<Socio>[];

export default function SociosTable({
                                        data,
                                        pageCount,
                                        onPaginationChange,
                                        onEditAction,
                                        onFiltroAction,
                                        onDeleteAction
                                    }: SociosTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editingSocio, setEditingSocio] = useState<Socio | undefined>(undefined)

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const handleSaveEdit = (editedSocio: Socio) => {
        onEditAction(editedSocio)
        setEditingSocio(undefined)
    }

    return (
        <div>
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                modulo='socio'
                onEditAction={useCheckPermission(1026, false) ? (e) => setEditingSocio(e) : undefined}
                onDeleteAction={useCheckPermission(1027, false) ? (e) => onDeleteAction(e) : undefined}
            />
            <SocioModal
                socioSelecionado={editingSocio}
                isOpen={!!editingSocio}
                onCloseAction={() => setEditingSocio(undefined)}
                onSaveAction={handleSaveEdit}
            />
        </div>
    )
}