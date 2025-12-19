'use client';

import React, { useState, useEffect } from 'react';
import {
    createColumnHelper,
    type PaginationState,
    ColumnDef,
} from '@tanstack/react-table';
import type { Bandeira, TModalidade } from '@/types/bandeira';
import DataTablePadrao from '@/components/Tabelas/DataTablePadrao';
import BandeiraModal from '@/app/cadastros/bandeiras/BandeiraModal';
import { Badge } from '@/components/ui/badge';
import { colunaModalidade } from '@/lib/utils';
import { stringSvgToDataUrl, SvgDisplay } from '@/components/Util/utils';
import Image from 'next/image';
import { useCheckPermission } from '@/hooks/useCheckPermission';

interface BandeirasTableProps {
    data: Bandeira[];
    pageCount: number;
    onPaginationChange: (pagination: PaginationState) => void;
    onEditAction: (bandeira: Bandeira) => void;
    onFiltroAction: (filtro: any) => void;
    onDeleteAction: (bandeira: Bandeira) => void;
}

const columnHelper = createColumnHelper<Bandeira>();

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
    columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('nome', {
        header: 'Nome',
        cell: (info) => info.getValue(),
        meta: {
            buttonFilter: true,
        },
    }),
    columnHelper.accessor('tipo', {
        header: 'Tipo',
        cell: (info) => (
            <Badge
                className={
                    info.getValue() === 'D'
                        ? 'bg-primary'
                        : 'bg-gray-200 text-primary'
                }
            >
                {info.getValue() === 'D' ? 'Débito' : 'Crédito'}
            </Badge>
        ),
        meta: {
            buttonFilter: true,
        },
    }),
    columnHelper.accessor('tipoAdicional', {
        header: 'Modalidade',
        cell: (info) => {
            let cor = corColunaModalidade(info.getValue());
            return (
                <Badge className={`${cor}`}>
                    {colunaModalidade(info.getValue())}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('bins', {
        header: 'Quantidade de BINs',
        cell: (info) => info.getValue()?.length ?? 0,
    }),
] as ColumnDef<Bandeira>[];

const corColunaModalidade = (value?: TModalidade) => {
    switch (value) {
        case 'AV':
            return 'bg-primary';
        case 'CD':
            return 'bg-purple-500';
        case 'PP':
            return 'bg-blue-400';
        case 'VC':
            return 'bg-green-500';
        case 'PX':
            return 'bg-[#00CED1]';
        default:
            return 'bg-red-800';
    }
};

export default function BandeirasTable({
    data,
    pageCount,
    onPaginationChange,
    onEditAction,
    onFiltroAction,
    onDeleteAction,
}: BandeirasTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [editingBandeira, setEditingBandeira] = useState<
        Bandeira | undefined
    >(undefined);

    useEffect(() => {
        onPaginationChange(pagination);
    }, [pagination, onPaginationChange]);

    const handleSaveEdit = (editedBandeira: Bandeira) => {
        onEditAction(editedBandeira);
        setEditingBandeira(undefined);
    };

    return (
        <div className="overflow-x-auto">
            <DataTablePadrao
                data={data}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={onPaginationChange}
                onFiltroAction={onFiltroAction}
                onEditAction={
                    useCheckPermission(1018, false)
                        ? (bandeira: Bandeira) => setEditingBandeira(bandeira)
                        : undefined
                }
                onDeleteAction={
                    useCheckPermission(1019, false) ? onDeleteAction : undefined
                }
                modulo="bandeira"
            />
            <BandeiraModal
                isOpen={!!editingBandeira}
                onCloseAction={() => setEditingBandeira(undefined)}
                onSaveAction={handleSaveEdit}
                objetoSelecionado={editingBandeira}
            />
        </div>
    );
}
