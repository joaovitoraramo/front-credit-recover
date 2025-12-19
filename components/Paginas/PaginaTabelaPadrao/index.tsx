'use client';

import DataTablePadrao, {
    IDataTableProps,
} from '@/components/Tabelas/DataTablePadrao';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Drawer from '@/components/Drawer';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import { Plus } from 'lucide-react';

interface IProps extends IDataTableProps {
    tituloPagina: string;
    tituloBotaoHeader: string;
    actionBotaoHeader: () => void;
    onFiltroAction: (e: string) => void;
}

export default function ({
    data,
    columns,
    pageCount,
    onPaginationChange,
    enableColumnHiding = true,
    defaultSortColumn,
    rowActions,
    onRowClick,
    onRowSelectionChange,
    selectedRowsAction,
    modulo,
    onEditAction,
    onViewAction,
    onDeleteAction,
    tituloPagina,
    tituloBotaoHeader,
    actionBotaoHeader,
    onFiltroAction,
}: IProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Drawer />
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {tituloPagina}
                    </h1>
                    <BotaoPadrao
                        variant="outline"
                        name={tituloBotaoHeader}
                        onClick={actionBotaoHeader}
                        icon={<Plus className="h-5 w-5 mr-2" />}
                    />
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <DataTablePadrao
                        data={data}
                        columns={columns}
                        pageCount={pageCount}
                        onPaginationChange={onPaginationChange}
                        onFiltroAction={onFiltroAction}
                        modulo={modulo}
                        onEditAction={onEditAction}
                        onViewAction={onViewAction}
                        onDeleteAction={onDeleteAction}
                        enableColumnHiding={enableColumnHiding}
                        onRowSelectionChange={onRowSelectionChange}
                        selectedRowsAction={selectedRowsAction}
                        onRowClick={onRowClick}
                        rowActions={rowActions}
                        defaultSortColumn={defaultSortColumn}
                    />
                </div>
            </div>
        </div>
    );
}
