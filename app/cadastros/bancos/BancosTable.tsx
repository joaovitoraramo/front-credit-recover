"use client"

import React, {useEffect, useState} from "react"
import {ColumnDef, createColumnHelper, type PaginationState,} from "@tanstack/react-table"
import type {Banco} from "@/types/banco"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import BancoModal from "@/app/cadastros/bancos/BancoModal";
import {useCheckPermission} from "@/hooks/useCheckPermission";
import Image from "next/image";
import {stringSvgToDataUrl} from "@/components/Util/utils";

interface BancosTableProps {
    data: Banco[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (banco: Banco) => void
    onFiltroAction: (filtro: any) => void
    onDeleteAction: (banco: Banco) => void
}

const columnHelper = createColumnHelper<Banco>()

const columns = [
    columnHelper.accessor('logo', {
        header: 'Logo',
        cell: (info) => (
            <Image
                src={stringSvgToDataUrl(info.getValue())}
                alt={'Sem Logo'}
                width={48}
                height={48}
                style={{
                    marginBottom: 8,
                }}
            />
        ),
    }),
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
    columnHelper.accessor("codigo", {
        header: "Código",
        cell: (info) => info.getValue(),
    }),
] as ColumnDef<Banco>[];

export default function BancosTable({
                                        data,
                                        pageCount,
                                        onPaginationChange,
                                        onEditAction,
                                        onFiltroAction,
                                        onDeleteAction
                                    }: BancosTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editingBanco, setEditingBanco] = useState<Banco | undefined>(undefined)

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const handleSaveEdit = (editedBanco: Banco) => {
        onEditAction(editedBanco)
        setEditingBanco(undefined)
    }

    return (
        <div>
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                modulo='banco'
                onEditAction={useCheckPermission(1022, false) ? (e) => setEditingBanco(e) : undefined}
                onDeleteAction={useCheckPermission(1023, false) ? (e) => onDeleteAction(e) : undefined}
            />
            <BancoModal
                bancoSelecionado={editingBanco}
                isOpen={!!editingBanco}
                onClose={() => setEditingBanco(undefined)}
                onSave={handleSaveEdit}
            />
        </div>
    )
}