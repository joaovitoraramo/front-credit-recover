"use client"

import React, {useState, useEffect} from "react"
import {
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import type {Usuario} from "@/types/usuario"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import UsuarioModal from "@/app/cadastros/usuarios/UsuarioModal";
import {Badge} from "@/components/ui/badge";
import {useCheckPermission} from "@/hooks/useCheckPermission";

interface IProps {
    data: Usuario[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (usuario: Usuario) => void
    onFiltroAction: (filtro: any) => void
}

const columnHelper = createColumnHelper<Usuario>()

const columns = [
    columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("nome", {
        header: "Nome",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
    columnHelper.accessor("isSuporte", {
        header: "Suporte",
        cell: (info) => (
            <Badge>
                {info.getValue() ? 'Sim' : 'Não'}
            </Badge>
        )
    }),
    columnHelper.accessor("dataCriacao", {
        header: "Data de Criação",
        cell: (info) => new Date(info.getValue() || "").toLocaleDateString(),
    }),
    columnHelper.accessor("clientes", {
        header: "Clientes",
        cell: (info) => info.getValue()?.length || 0,
    }),

] as ColumnDef<Usuario>[]


export default function ({data, pageCount, onPaginationChange, onEditAction, onFiltroAction}: IProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>(undefined)

    const handleSaveEdit = (editedUsuario: Usuario) => {
        onEditAction(editedUsuario)
        setEditingUsuario(undefined)
    }

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    return (
        <div>
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                modulo='usuario'
                onEditAction={useCheckPermission(1010, false) ? (e) => setEditingUsuario(e) : undefined}
            />
            <UsuarioModal
                isOpen={!!editingUsuario}
                onCloseAction={() => setEditingUsuario(undefined)}
                onSaveAction={handleSaveEdit}
                usuarioSelecionado={editingUsuario}
            />
        </div>
    )
}