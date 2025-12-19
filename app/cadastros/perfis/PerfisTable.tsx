"use client"

import {useState, useEffect} from "react"
import {
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import {IPerfil, IPermissao} from "@/types/perfil";
import PerfisModal from "@/app/cadastros/perfis/PerfisModal";
import {useCheckPermission} from "@/hooks/useCheckPermission";

interface PerfisTableProps {
    data: IPerfil[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (perfil: IPerfil) => void
    onFiltroAction: (filtro: any) => void
    onDeleteAction: (perfil: IPerfil) => void
}

const columnHelper = createColumnHelper<IPerfil>()

const columns = [
    columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("nome", {
        header: "Nome",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true,
        }
    }),
    columnHelper.accessor("permissoes", {
        header: "Permissões",
        cell: (info) => info.getValue().length,
    }),
] as ColumnDef<IPerfil>[];

export default function PerfisTable({
                                        data,
                                        pageCount,
                                        onPaginationChange,
                                        onEditAction,
                                        onFiltroAction,
                                        onDeleteAction
                                    }: PerfisTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editing, setEditing] = useState<IPerfil | undefined>(undefined)

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const handleSaveEdit = (edited: IPerfil) => {
        onEditAction(edited)
        setEditing(undefined)
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
                onEditAction={useCheckPermission(1006, false) ? (e) => setEditing(e) : undefined}
                onDeleteAction={useCheckPermission(1007, false) ? (e) => onDeleteAction(e) : undefined}
            />
            <PerfisModal
                perfilSelecionado={editing}
                isOpen={!!editing}
                onCloseAction={() => setEditing(undefined)}
                onSaveAction={handleSaveEdit}
            />
        </div>
    )
}