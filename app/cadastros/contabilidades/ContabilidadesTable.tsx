"use client"

import {useState, useEffect} from "react"
import {
    createColumnHelper,
    type PaginationState, ColumnDef,
} from "@tanstack/react-table"
import type {Contabilidade} from "@/types/contabilidade"
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import ContabilidadeModal from "@/app/cadastros/contabilidades/ContabilidadeModal";
import {useCheckPermission} from "@/hooks/useCheckPermission";

interface ContabilidadesTableProps {
    data: Contabilidade[]
    pageCount: number
    onPaginationChange: (pagination: PaginationState) => void
    onEditAction: (contabilidade: Contabilidade) => void
    onDeleteAction: (contabilidade: Contabilidade) => void
    onFiltroAction: (filtro: any) => void
}

const columnHelper = createColumnHelper<Contabilidade>()

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
    columnHelper.accessor("ie", {
        header: "IE",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ativo", {
        header: "Ativo",
        cell: (info) => (info.getValue() ? "Sim" : "Não"),
    }),
    columnHelper.accessor("dataCadastro", {
        header: "Data de Cadastro",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    }),
    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true
        }
    }),
] as ColumnDef<Contabilidade>[];

export default function ContabilidadesTable({
                                                data,
                                                pageCount,
                                                onPaginationChange,
                                                onEditAction,
                                                onFiltroAction,
                                                onDeleteAction
                                            }: ContabilidadesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [editingContabilidade, setEditingContabilidade] = useState<Contabilidade | undefined>(undefined)

    useEffect(() => {
        onPaginationChange(pagination)
    }, [pagination, onPaginationChange])

    const handleSaveEdit = (editedContabilidade: Contabilidade) => {
        onEditAction(editedContabilidade)
        setEditingContabilidade(undefined)
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
                onEditAction={useCheckPermission(1030, false) ? (e) => setEditingContabilidade(e) : undefined}
                onDeleteAction={useCheckPermission(1031, false) ? onDeleteAction : undefined}
            />
            <ContabilidadeModal
                isOpen={!!editingContabilidade}
                objetoSelecionado={editingContabilidade}
                onCloseAction={() => setEditingContabilidade(undefined)}
                onSaveAction={handleSaveEdit}
            />
        </div>
    )
}

