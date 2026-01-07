"use client"

import React, {useEffect, useState} from "react"
import {ColumnDef, createColumnHelper, type PaginationState,} from "@tanstack/react-table"
import type {Adquirente} from "@/types/adquirente"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import AdquirenteModal from "@/app/cadastros/adquirentes/AdquirenteModal";
import {useCheckPermission} from "@/hooks/useCheckPermission";
import Image from "next/image";
import {stringSvgToDataUrl} from "@/components/Util/utils";

interface AdquirentesTableProps {
    data: Adquirente[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (adquirente: Adquirente) => void
    onFiltroAction: (filtro: any) => void
    onDeleteAction: (adquirente: Adquirente) => void
}

const columnHelper = createColumnHelper<Adquirente>()

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
    columnHelper.accessor("nomePlanilha", {
        header: "Nome na Planilha",
        cell: (info) => info.getValue(),
    }),
] as ColumnDef<Adquirente>[];

export default function AdquirentesTable({
                                             data,
                                             pageCount,
                                             onPaginationChange,
                                             onEditAction,
                                             onFiltroAction,
                                             onDeleteAction
                                         }: AdquirentesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editingAdquirente, setEditingAdquirente] = useState<Adquirente | undefined>(undefined)

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const handleSaveEdit = (editedAdquirente: Adquirente) => {
        onEditAction(editedAdquirente)
        setEditingAdquirente(undefined)
    }

    return (
        <div>
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                modulo='adquirente'
                onEditAction={useCheckPermission(1014, false) ? (e) => setEditingAdquirente(e) : undefined}
                onDeleteAction={useCheckPermission(1015, false) ? (e) => onDeleteAction(e) : undefined}
            />
            <AdquirenteModal
                adquirenteSelecionado={editingAdquirente}
                isOpen={!!editingAdquirente}
                onCloseAction={() => setEditingAdquirente(undefined)}
                onSaveAction={handleSaveEdit}
            />
        </div>
    )
}

