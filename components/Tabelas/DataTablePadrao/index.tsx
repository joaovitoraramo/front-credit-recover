'use client';

import * as React from 'react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleX,
    Eye,
    Filter,
    Pencil,
    Save,
    Trash2,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import CheckBoxPadrao from '@/components/Botoes/CheckBoxPadrao';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';
import SelectPadrao from '@/components/Inputs/SelectPadrao';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {ExportColumn} from "@/types/export";

export interface IDataTableProps {
    data: any[];
    columns: ColumnDef<any>[];
    pageCount: number;
    onPaginationChange: (pagination: PaginationState) => void;
    enableColumnHiding?: boolean;
    onRowClick?: (row: any) => void;
    onRowSelectionChange?: (selectedRows: any[]) => void;
    rowActions?: (row: any) => ReactNode | null;
    defaultSortColumn?: string;
    selectedRowsAction?: ISelectedRowsAction[];
    modulo?: string;
    onEditAction?: (item: any) => void;
    onViewAction?: (item: any) => void;
    canDelete?: (row: any) => boolean;
    onDeleteAction?: (item: any, index?: number) => void;
    onFiltroAction?: (e: any) => void;
    hideHeader?: boolean;
    hideFooter?: boolean;
    disableSelect?: boolean;
    iconView?: ReactNode;
    canContextOpen?: boolean;
    columnsToTotalize?: { id: string; accessorKey: string }[];
    showExportButton?: boolean;
    onExportColumnsChange?: (columns: ExportColumn<any>[]) => void;
}

export interface ISelectedRowsAction {
    icon: ReactNode;
    nome: string;
    onClick: (e?: any) => void;
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
                             onDeleteAction,
                             canDelete,
                             onEditAction,
                             onViewAction,
                             onFiltroAction,
                             hideHeader,
                             hideFooter,
                             disableSelect,
                             iconView,
                             canContextOpen,
                             columnsToTotalize = [],
                             showExportButton = false,
    onExportColumnsChange
                         }: IDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>(
        defaultSortColumn
            ? [
                {
                    id: defaultSortColumn,
                    desc: false,
                },
            ]
            : [],
    );
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());

    const pageSizeOptions = [10, 20, 50, 100, 1000, 10000];
    const [filterInputs, setFilterInputs] = useState<any>({});
    const [allColumns, setAllColumns] = useState(columns);
    let userEmail: string | null = null;
    if (typeof window !== 'undefined') {
        userEmail = localStorage.getItem('userEmail');
    }
    const { toast } = useToast();
    const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(
        null,
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        row: any;
    } | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    useEffect(() => {
        onPaginationChange(pagination);
    }, [pagination, onPaginationChange]);

    useEffect(() => {
        onFiltroAction && onFiltroAction(filterInputs);
    }, [filterInputs]);

    const handleDeleteClick = (row: any) => {
        if (onDeleteAction) {
            onDeleteAction(row.original, row.index);
        }

        const rowId = row.id;
        const newPendingDelete = new Set(pendingDelete);

        if (newPendingDelete.has(rowId)) {
            newPendingDelete.delete(rowId);
        } else {
            newPendingDelete.add(rowId);
        }

        setPendingDelete(newPendingDelete);
    };


    const tableColumns = [
        ...(disableSelect
            ? []
            : [
                {
                    id: 'select',
                    header: ({ table }: { table: any }) => (
                        <CheckBoxPadrao
                            checked={table.getIsAllPageRowsSelected()}
                            onChange={(value) =>
                                table.toggleAllPageRowsSelected(value)
                            }
                        />
                    ),
                    cell: ({ row }: { row: any }) => (
                        <CheckBoxPadrao
                            checked={row.getIsSelected()}
                            onChange={(value) => row.toggleSelected(value)}
                        />
                    ),
                    enableHiding: false,
                },
            ]),
        ...(onEditAction || onViewAction || onDeleteAction
            ? [
                {
                    id: 'actions',
                    header: 'Ações',
                    cell: ({ row }: { row: any }) => (
                        <div className="inline-flex space-x-1">
                            {onEditAction && (
                                <BotaoPadrao
                                    variant="ghost"
                                    icon={<Pencil className="h-4 w-4" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditAction(row.original);
                                    }}
                                />
                            )}
                            {onViewAction && (
                                <BotaoPadrao
                                    variant="ghost"
                                    icon={
                                        iconView ? (
                                            iconView
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewAction(row.original);
                                    }}
                                />
                            )}
                            {/* PASSO 2 (Continuação): Associar a nova função ao botão. */}
                            {onDeleteAction && (
                                <BotaoPadrao
                                    variant="destructive"
                                    transparent
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(row); // Chamada para a nova função de controle.
                                    }}
                                    disabled={
                                        canDelete && !canDelete(row.original)
                                    }
                                />
                            )}
                        </div>
                    ),
                    enableHiding: false,
                },
            ]
            : []),
        ...allColumns,
    ];

    const table = useReactTable({
        data,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: (updater) => {
            setRowSelection(updater);
            setTimeout(() => {
                if (onRowSelectionChange) {
                    const selectedRows = data.filter((row) => {
                        const rowInTable = table
                            .getRowModel()
                            .rows.find((r) => r.original === row);
                        return rowInTable?.getIsSelected();
                    });
                    onRowSelectionChange(selectedRows);
                }
            }, 0);
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onPaginationChange: setPagination,
        pageCount,
        manualPagination: true,
    });

    useEffect(() => {
        if (!onExportColumnsChange) return;

        const excluded = ['select', 'actions', 'expander'];

        const exportColumns = table
            .getVisibleFlatColumns()
            .filter(col => !excluded.includes(col.id))
            .map(col => ({
                id: col.id,
                header:
                    typeof col.columnDef.header === 'string'
                        ? col.columnDef.header
                        : col.id,
                accessor: (row: any) => {
                    return row[col.id];
                },
            }));

        onExportColumnsChange(exportColumns);
    }, [
        table.getState().columnVisibility,
        allColumns, // ordem
    ]);


    const handleExportExcel = () => {
        const excludedColumnIds = ['select', 'actions', 'expander'];

        const exportableColumns = table.getVisibleFlatColumns().filter(
            column => !excludedColumnIds.includes(column.id)
        );

        const headerRow = exportableColumns.map(column => {
            if (typeof column.columnDef.header === 'string') {
                return column.columnDef.header;
            } else if (typeof column.columnDef.header === 'function') {
                const headerContent = column.columnDef.header({
                    column,
                    header: column.columnDef.header as any,
                    table: table
                });
                if (React.isValidElement(headerContent) && headerContent.props && (headerContent.props as any).children) {
                    return (headerContent.props as any).children;
                }
                return column.id;
            }
            return column.id;
        });

        const dataForExport = table.getRowModel().rows.map(row => {
            const rowData: { [key: string]: any } = {};
            exportableColumns.forEach(column => {
                const cellValue = row.getValue(column.id);
                rowData[column.id] = cellValue;
            });
            return rowData;
        });

        const exportData = [headerRow, ...dataForExport.map(row => {
            return exportableColumns.map(column => row[column.id]);
        })];

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dados");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'export.xlsx');
    };


    const handleOnDragEnd = (event: any) => {
        const { active, over } = event;

        if (!active || !over) {
            return;
        }

        if (active.id !== over.id) {
            const activeIndex = allColumns.findIndex(
                (col: any) => col.accessorKey === active.id,
            );
            const overIndex = allColumns.findIndex(
                (col: any) => col.accessorKey === over.id,
            );

            if (activeIndex === -1 || overIndex === -1) {
                return;
            }

            const newColumns = [...allColumns];
            const [movedColumn] = newColumns.splice(activeIndex, 1);

            if (overIndex > activeIndex) {
                newColumns.splice(overIndex, 0, movedColumn);
            } else {
                newColumns.splice(overIndex, 0, movedColumn);
            }

            setAllColumns(newColumns);
        }
    };

    useEffect(() => {
        loadColumnPreferences();
    }, [userEmail]);

    const loadColumnPreferences = () => {
        if (!userEmail || !modulo) return;

        if (typeof window !== 'undefined') {
            const storedColumns = localStorage.getItem(
                `columns_${modulo}_${userEmail}`,
            );
            const storedVisibility = localStorage.getItem(
                `visibility_${modulo}_${userEmail}`,
            );

            if (storedColumns) {
                const storedHeaders = JSON.parse(storedColumns);

                const newColumns = storedHeaders.map((storedHeader: any) => {
                    const originalColumn = columns.find(
                        (col) => col.header === storedHeader.header,
                    );

                    if (originalColumn) {
                        return originalColumn;
                    } else {
                        console.warn(
                            `Coluna com header "${storedHeader.header}" não encontrada nas colunas originais.`,
                        );
                        return {
                            header: storedHeader.header,
                        };
                    }
                });

                setAllColumns(newColumns);
            }

            if (storedVisibility) {
                setColumnVisibility(JSON.parse(storedVisibility));
            }
        }
    };

    const saveColumnPreferences = () => {
        if (!userEmail || !modulo) return;

        const columnHeaders = allColumns.map((col) => ({
            header: col.header,
        }));
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                `columns_${modulo}_${userEmail}`,
                JSON.stringify(columnHeaders),
            );
            localStorage.setItem(
                `visibility_${modulo}_${userEmail}`,
                JSON.stringify(columnVisibility),
            );
        }

        toast({
            title: 'Preferências do Usuário',
            description: 'Preferências de tabela salvas para o usuário.',
            className:
                'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-blue-600 text-[#0069AF] bg-white',
        });
    };

    const getTransformStyle = (transform: any) => {
        if (!transform) {
            return undefined;
        }

        const { x, y, scaleX, scaleY } = transform;

        return `translate3d(${x}px, ${y}px, 0px) scale(${scaleX}, ${scaleY})`;
    };

    function Column({ column }: { column: any }) {
        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({ id: column.id });
        const [isChecked, setIsChecked] = useState(column.getIsVisible());

        const style = {
            transform: getTransformStyle(transform),
            transition,
        };

        const handleMouseDown = (event: React.MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
            const newValue = !isChecked;
            setIsChecked(newValue);
            column.toggleVisibility(newValue);
        };

        return (
            <DropdownMenuItem
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="capitalize hover:bg-gray-100 cursor-move"
                onMouseDown={handleMouseDown}
            >
                <div>
                    <Switch className="bg-primary" checked={isChecked} />
                </div>
                <div>{column.id}</div>
            </DropdownMenuItem>
        );
    }

    useEffect(() => {
        if (openFilterColumn && inputRef.current) {
            inputRef.current.focus();
        }
    }, [openFilterColumn]);

    function renderPageButtons() {
        const pageCount = table.getPageCount();
        const currentPage = table.getState().pagination.pageIndex;
        const visiblePages = 10;

        let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
        let endPage = Math.min(pageCount - 1, startPage + visiblePages - 1);

        if (endPage - startPage + 1 < visiblePages) {
            startPage = Math.max(0, endPage - visiblePages + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <BotaoPadrao
                    chave={i + 1}
                    key={i + 1}
                    onClick={(e) => {
                        e.stopPropagation();
                        table.setPageIndex(i);
                    }}
                    name={(i + 1).toString()}
                    variant={currentPage === i ? 'outline' : 'ghost'}
                    disabled={currentPage === i}
                />,
            );
        }
        return pages;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                contextMenu &&
                !(event.target as HTMLElement).closest(
                    'div[style*="position: fixed;"]',
                )
            ) {
                setContextMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu]);

    const contextMenuRender = () => {
        return (
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        key="context-menu"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{
                            position: 'fixed',
                            top: contextMenu.y,
                            left: contextMenu.x,
                            backgroundColor: '#ffffff',
                            borderColor: '#dee2e6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            minWidth: '220px',
                            padding: '6px 0',
                            border: '1px solid #e0e0e0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {Object.keys(rowSelection).length > 0 && (
                            <ul
                                style={{
                                    listStyleType: 'none',
                                    padding: 0,
                                    margin: 0,
                                }}
                            >
                                <li
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#495057',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    {Object.keys(rowSelection).length} item(s)
                                    selecionado(s)
                                </li>
                                <li>
                                    <BotaoPadrao
                                        variant="ghost"
                                        transparent
                                        icon={<CircleX className="h-5 w-5" />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            table.toggleAllRowsSelected(false);
                                            setContextMenu(null);
                                        }}
                                        name="Limpar Seleção"
                                        style={{
                                            color: '#495057',
                                        }}
                                    />
                                    <Separator />
                                </li>
                                {selectedRowsAction &&
                                    selectedRowsAction.map(
                                        ({ icon, nome, onClick }, index) => (
                                            <li key={index}>
                                                <BotaoPadrao
                                                    variant="ghost"
                                                    transparent
                                                    icon={icon}
                                                    onClick={() => {
                                                        const selectedRows =
                                                            table
                                                                .getSelectedRowModel()
                                                                .rows.map(
                                                                (row) =>
                                                                    row.original,
                                                            );
                                                        onClick(selectedRows);
                                                        setContextMenu(null);
                                                        table.toggleAllRowsSelected(
                                                            false,
                                                        );
                                                    }}
                                                    name={nome}
                                                    style={{
                                                        color: '#495057',
                                                    }}
                                                />
                                                {index <
                                                    selectedRowsAction.length -
                                                    1 && <Separator />}
                                            </li>
                                        ),
                                    )}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    const calculateColumnTotal = (accessorKey: string) => {
        return data.reduce((sum, row) => {
            const value = accessorKey.split('.').reduce((o, i) => o ? o[i] : undefined, row);
            return sum + (typeof value === 'number' ? value : 0);
        }, 0);
    };

    return (
        <div
            className="w-full relative"
            onClick={() => openFilterColumn && setOpenFilterColumn(null)}
        >
            <div className="w-full z-10 relative ">
                <div className="flex justify-end items-center py-4 ml-4 mr-4">
                    <div className="mr-2">
                        {Object.keys(rowSelection).length > 0 && (
                            <>
                                {Object.keys(rowSelection).length} item(s)
                                selecionados(s)
                                <BotaoPadrao
                                    variant="ghost"
                                    transparent
                                    icon={<CircleX className="h-5 w-5" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        table.toggleAllRowsSelected(false);
                                    }}
                                    name="Limpar Seleção"
                                />
                                {selectedRowsAction &&
                                    selectedRowsAction.map(
                                        ({ icon, nome, onClick }, index) => (
                                            <BotaoPadrao
                                                key={index}
                                                variant="ghost"
                                                transparent
                                                icon={icon}
                                                onClick={() => {
                                                    const selectedRows = table
                                                        .getSelectedRowModel()
                                                        .rows.map(
                                                            (row) =>
                                                                row.original,
                                                        );
                                                    onClick(selectedRows);
                                                }}
                                                name={nome}
                                            />
                                        ),
                                    )}
                            </>
                        )}
                    </div>
                    <div>
                        {showExportButton && (
                            <Button
                                variant="outline"
                                className="ml-auto font-bold py-2 px-4 rounded-full mr-4 items-center transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10 bg-transparent text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/50"
                                onClick={handleExportExcel}
                            >
                                Exportar <Download className="mr-2 h-4 w-4" />
                            </Button>
                        )}
                        {enableColumnHiding && modulo && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="ml-auto font-bold py-2 px-4 rounded-full mr-4 items-center transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10 bg-transparent text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/50"
                                    >
                                        Colunas <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleOnDragEnd}
                                    >
                                        <SortableContext
                                            items={table
                                                .getAllColumns()
                                                .filter((col) =>
                                                    col.getCanHide(),
                                                )
                                                .map((col) => col.id)}
                                        >
                                            {table
                                                .getAllColumns()
                                                .filter((col) =>
                                                    col.getCanHide(),
                                                )
                                                .map((column) => (
                                                    <Column
                                                        key={column.id}
                                                        column={column}
                                                    />
                                                ))}
                                            <BotaoPadrao
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    saveColumnPreferences();
                                                }}
                                                variant="ghost"
                                                transparent
                                                name="Salvar preferencias"
                                                icon={
                                                    <Save className="h-5 w-5" />
                                                }
                                            />
                                        </SortableContext>
                                    </DndContext>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
                <div className="ml-4 mr-4 mb-4 rounded-md border">
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleOnDragEnd}
                    >
                        <Table>
                            {!hideHeader && (
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => {
                                                        const col =
                                                            header.column;
                                                        return (
                                                            <TableHead
                                                                key={header.id}
                                                                id={col.id}
                                                                className="relative"
                                                                style={{
                                                                    whiteSpace:
                                                                        'nowrap',
                                                                }}
                                                            >
                                                                <div className="flex items-center">
                                                                    {header.isPlaceholder
                                                                        ? null
                                                                        : flexRender(
                                                                            header
                                                                                .column
                                                                                .columnDef
                                                                                .header,
                                                                            header.getContext(),
                                                                        )}
                                                                    {

                                                                        !header.isPlaceholder &&
                                                                        header
                                                                            .column
                                                                            .columnDef
                                                                            .meta &&
                                                                        (header
                                                                            .column
                                                                            .columnDef
                                                                            .meta as any)
                                                                            .buttonFilter && (
                                                                            <BotaoPadrao
                                                                                variant="ghost"
                                                                                transparent
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.preventDefault();
                                                                                    if (
                                                                                        openFilterColumn &&
                                                                                        openFilterColumn !==
                                                                                        col.id
                                                                                    ) {
                                                                                        setFilterInputs(
                                                                                            {
                                                                                                [openFilterColumn]:
                                                                                                    '',
                                                                                            },
                                                                                        );
                                                                                    }
                                                                                    setOpenFilterColumn(
                                                                                        openFilterColumn ===
                                                                                        col.id
                                                                                            ? null
                                                                                            : col.id,
                                                                                    );
                                                                                    setFilterInputs(
                                                                                        {
                                                                                            [col.id]:
                                                                                                '',
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                icon={
                                                                                    <Filter className="h-4 w-4" />
                                                                                }
                                                                            />
                                                                        )
                                                                    }
                                                                </div>
                                                                {openFilterColumn ===
                                                                    col.id && (
                                                                        <Input
                                                                            ref={
                                                                                inputRef
                                                                            }
                                                                            placeholder={`Pesquisar por ${col.id}...`}
                                                                            value={
                                                                                filterInputs[
                                                                                    col
                                                                                        .id
                                                                                    ]
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                setFilterInputs(
                                                                                    {
                                                                                        ...filterInputs,
                                                                                        [col.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    },
                                                                                );
                                                                                setColumnFilters(
                                                                                    {
                                                                                        ...columnFilters,
                                                                                        [col.id]:
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                                ? e
                                                                                                    .target
                                                                                                    .value
                                                                                                : undefined,
                                                                                    },
                                                                                );
                                                                            }}
                                                                            onKeyDown={(
                                                                                e,
                                                                            ) => {
                                                                                if (
                                                                                    e.key ===
                                                                                    'Escape'
                                                                                ) {
                                                                                    setOpenFilterColumn(
                                                                                        null,
                                                                                    );
                                                                                    e.stopPropagation();
                                                                                }
                                                                            }}
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                            className="absolute top-full left-0 mt-2 w-auto rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 z-50"
                                                                        />
                                                                    )}
                                                            </TableHead>
                                                        );
                                                    },
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                            )}
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        // PASSO 3: Aplicar o estilo condicional na linha.
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                'selected'
                                            }
                                            onClick={() => {
                                                !disableSelect &&
                                                row.toggleSelected();
                                            }}
                                            // A mágica acontece aqui: aplicamos a classe de opacidade se a linha
                                            // estiver no nosso estado 'pendingDelete'.
                                            className={`${
                                                onRowClick ? 'cursor-pointer' : ''
                                            } transition-opacity duration-300 ${ // Adiciona uma transição suave
                                                pendingDelete.has(row.id) ? 'opacity-40' : 'opacity-100'
                                            }`}
                                            onContextMenu={(e) => {
                                                if (!canContextOpen)
                                                    return null;
                                                if (
                                                    row.getIsSelected() &&
                                                    'selected'
                                                ) {
                                                    e.preventDefault();
                                                    setContextMenu({
                                                        x: e.pageX,
                                                        y: e.pageY,
                                                        row: row.original,
                                                    });
                                                }
                                            }}
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                            {rowActions && (
                                                <TableCell
                                                    style={{
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {rowActions(row.original)}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                columns.length +
                                                (rowActions ? 1 : 0)
                                            }
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {columnsToTotalize.length > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        {table.getAllColumns().map((column) => {

                                            const totalColumnInfo = columnsToTotalize.find(
                                                (colToTotalize) => colToTotalize.id === column.id
                                            );

                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    className="font-bold whitespace-nowrap"
                                                >
                                                    {totalColumnInfo
                                                        ? `${calculateColumnTotal(
                                                            totalColumnInfo.accessorKey
                                                        ).toLocaleString('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                        })}`
                                                        : null}
                                                </TableCell>
                                            );
                                        })}
                                        {rowActions && (
                                            <TableCell className="font-bold whitespace-nowrap">
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </DndContext>
                </div>
                {!hideFooter && (
                    <div className="py-3 flex items-center justify-between border-t border-gray-200 bg-white">
                        <div className="flex items-center ml-2">
                            <SelectPadrao
                                id="size"
                                name="size"
                                label="Exibir"
                                value={pagination.pageSize.toString()}
                                onChange={(e) => table.setPageSize(Number(e))}
                                options={pageSizeOptions.map((size) => ({
                                    value: size.toString(),
                                    label: `${size} registros`,
                                }))}
                                closeOnSelect
                            />
                        </div>
                        <div>
                            <footer
                                className="relative z-0 inline-flex rounded-full shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <BotaoPadrao
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        table.previousPage();
                                    }}
                                    disabled={!table.getCanPreviousPage}
                                    variant="ghost"
                                    icon={<ChevronLeft aria-hidden="true" />}
                                />
                                {renderPageButtons()}
                                <BotaoPadrao
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        table.nextPage();
                                    }}
                                    disabled={!table.getCanNextPage()}
                                    variant="ghost"
                                    icon={<ChevronRight aria-hidden="true" />}
                                />
                            </footer>
                        </div>
                        <div className="flex-1 flex items-center justify-end mr-8">
                            <p className="text-sm text-gray-700">
                                Mostrando{' '}
                                <span className="font-medium">
                                    {pagination.pageIndex *
                                        pagination.pageSize +
                                        1}
                                </span>{' '}
                                até{' '}
                                <span className="font-medium">
                                    {Math.min(
                                        (pagination.pageIndex + 1) *
                                        pagination.pageSize,
                                        pageCount * pagination.pageSize,
                                    )}
                                </span>{' '}
                                de{' '}
                                <span className="font-medium">
                                    {pageCount * pagination.pageSize}
                                </span>{' '}
                                resultados
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {contextMenuRender()}
        </div>
    );
}