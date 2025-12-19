"use client"

import React, {useState, useEffect, useMemo} from "react"
import {Plus, Edit, Trash, Settings, Undo2, Import} from "lucide-react"
import type {BandeirasCliente, BandeiraConfig} from "@/types/bandeirasCliente"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import BandeiraClienteModal from "@/app/cadastros/clientes/BandeiraClienteModal";
import BandeiraConfigModal from "@/app/cadastros/clientes/BandeiraConfigModal";
import DataTablePadrao from "@/components/Tabelas/DataTablePadrao";
import {ColumnDef, createColumnHelper, type PaginationState} from "@tanstack/react-table";
import type {Client as Cliente} from "@/types/client";
import {useLoading} from "@/context/LoadingContext";
import {Badge} from "@/components/ui/badge";
import {colunaModalidade} from "@/lib/utils";
import type {TModalidade} from "@/types/bandeira";
import ImportAlignmentModal from "./ImportAlignmentModal";


interface ClientBandeirasTabProps {
    bandeirasClienteProp: BandeirasCliente[]
    onDeleteAction: (bandeiraClienteId?: number | null) => void
    onUndoDeleteAction: (bandeiraClienteId?: number | null) => void
    onAddAction: (newBandeiraCliente: Omit<BandeirasCliente, "id" | "cliente">) => void
    onEditAction: (bandeiraCliente: BandeirasCliente) => void
}

export default function ClienteBandeirasTab({
                                                bandeirasClienteProp,
                                                onDeleteAction,
                                                onAddAction,
                                                onEditAction,
                                                onUndoDeleteAction
                                            }: ClientBandeirasTabProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [editingBandeiraCliente, setEditingBandeiraCliente] = useState<BandeirasCliente | undefined>(undefined)
    const [isBandeiraConfigModalOpen, setIsBandeiraConfigModalOpen] = useState(false)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [bandeirasCliente, setBandeirasCliente] = useState<BandeirasCliente[]>(bandeirasClienteProp);
    const originalBandeirasCliente = useMemo(() => [...bandeirasClienteProp], [bandeirasClienteProp]);
    const {setIsLoading} = useLoading();

    useEffect(() => {
        setBandeirasCliente(bandeirasClienteProp);
    }, [bandeirasClienteProp]);

    const handleAdd = (newBandeiraCliente: Omit<BandeirasCliente, "id" | "cliente">) => {
        onAddAction({
            ...newBandeiraCliente,
            diasPagamento: newBandeiraCliente.diasPagamento === 0 ? 0 : Number(newBandeiraCliente.diasPagamento),
        })
        setIsAddModalOpen(false)
    }

    const handleEdit = (bandeiraCliente: BandeirasCliente) => {
        onEditAction(bandeiraCliente)
        setEditingBandeiraCliente(bandeiraCliente)
        setIsAddModalOpen(true)
    }

    const handleDelete = (bandeiraCliente: BandeirasCliente) => {
        onDeleteAction(bandeiraCliente.id)
    }

    const handleAddClick = (e: any) => {
        e.preventDefault();
        setIsAddModalOpen(true)
    }

    const handleImportClick = (e: any) => {
        e.preventDefault();
        setIsImportModalOpen(true)
    }

    const handleConfigureBandeira = (bandeiraCliente: BandeirasCliente) => {
        setEditingBandeiraCliente(bandeiraCliente)
        setIsBandeiraConfigModalOpen(true)
    }

    const handleCloseBandeiraConfigModal = () => {
        setIsBandeiraConfigModalOpen(false)
        setEditingBandeiraCliente(undefined)
    }

    const handleSaveBandeiraConfig = (updatedBandeira: BandeirasCliente) => {
        setEditingBandeiraCliente(updatedBandeira)
        onEditAction(updatedBandeira);
        handleCloseBandeiraConfigModal()
    }

    const columnHelper = createColumnHelper<BandeirasCliente>()

    const columns = [
        columnHelper.accessor("bandeira.nome", {
            header: "Bandeira",
            cell: (info) => info.getValue(),
            meta: {
                buttonFilter: true
            }
        }),
        columnHelper.accessor("banco.nome", {
            header: "Banco",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("adquirente.nome", {
            header: "Adquirente",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("agencia", {
            header: "Agencia",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("conta", {
            header: "Conta",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("bandeira.tipo", {
            header: "Tipo",
            cell: (info) => (
                <Badge className={info.getValue() === 'D' ? 'bg-primary' : 'bg-gray-200 text-primary'}>
                    {info.getValue() === 'D' ? 'Débito' : 'Crédito'}
                </Badge>
            ),
        }),
        columnHelper.accessor("bandeira.tipoAdicional", {
            header: "Modalidade",
            cell: (info) => (
                <Badge className={`${corColunaModalidade(info.getValue())}`}>
                    {colunaModalidade(info.getValue())}
                </Badge>
            ),
        }),
    ] as ColumnDef<Cliente>[];

    const corColunaModalidade = (value?: TModalidade) => {
        switch (value) {
            case 'AV':
                return 'bg-primary'
            case 'CD':
                return 'bg-purple-500'
            case 'PP':
                return 'bg-blue-400'
            case 'VC':
                return 'bg-green-500'
            case 'PX':
                return 'bg-[#00CED1]'
            default:
                return 'bg-red-800'
        }
    }

    const handleFiltroAction = async (filtro: any) => {
        if (Object.keys(filtro).length === 0) {
            setBandeirasCliente(bandeirasClienteProp);
            return;
        }

        let resultadoFiltrado = [...bandeirasClienteProp];

        for (const key in filtro) {
            if (filtro.hasOwnProperty(key)) {
                const valorFiltro = filtro[key].toLowerCase();
                const campo = key.split('_')[1];
                const prefixo = key.split('_')[0];

                resultadoFiltrado = resultadoFiltrado.filter((bandeiraCliente: BandeirasCliente) => {
                    let valorBandeiraCliente;

                    if (prefixo === 'bandeira' && bandeiraCliente.bandeira) {
                        // @ts-ignore
                        valorBandeiraCliente = bandeiraCliente.bandeira[campo];
                    } else if (prefixo === 'banco' && bandeiraCliente.banco) {
                        // @ts-ignore
                        valorBandeiraCliente = bandeiraCliente.banco[campo];
                    } else if (prefixo === 'adquirente' && bandeiraCliente.adquirente) {
                        // @ts-ignore
                        valorBandeiraCliente = bandeiraCliente.adquirente[campo];
                    } else {
                        // @ts-ignore
                        valorBandeiraCliente = bandeiraCliente[campo];
                    }

                    if (valorBandeiraCliente !== undefined && valorBandeiraCliente !== null) {
                        if (typeof valorBandeiraCliente === 'number' && typeof valorFiltro === 'string') {
                            return valorBandeiraCliente === Number(valorFiltro);
                        } else {
                            return valorBandeiraCliente.toString().toLowerCase().includes(valorFiltro);
                        }
                    }
                    return false;
                });
            }
        }

        setBandeirasCliente(resultadoFiltrado);
    };

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
    };

    const getPaginatedData = () => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return bandeirasCliente.slice(start, end);
    };

    const pageCount = Math.ceil(bandeirasCliente.length / pagination.pageSize);

    const handleImportAlignment = (sourceClient: Cliente) => {
        if (!sourceClient.bandeirasCliente) {
            console.error('Cliente atual ou cliente de origem inválido para importação.');
            return;
        }
        const updatedBandeirasCliente: BandeirasCliente[] = sourceClient.bandeirasCliente.map(bc => ({
            ...bc,
            id: null,
            bandeiraConfig: bc.bandeirasConfig.map(config => ({
                ...config,
                id: undefined,
            })),
            agencia: bc.agencia,
            conta: bc.conta,

        }));

        console.log(`Configurações importadas de ${sourceClient.nomeFantasia} para o cadastro atual.`);
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
                <TituloPadrao tamanho='h3' titulo='Bandeiras do Cliente'/>
                <div className="flex gap-x-4">
                    <BotaoPadrao
                        variant='outline'
                        name='Importar alinhamento'
                        onClick={handleImportClick}
                        icon={<Import className="h-5 w-5 mr-2"/>}
                    />
                    <BotaoPadrao
                        variant='outline'
                        name='Adicionar Bandeira'
                        onClick={handleAddClick}
                        icon={<Plus className="h-5 w-5 mr-2"/>}
                    />
                </div>
            </div>
            <DataTablePadrao
                disableSelect
                data={getPaginatedData()}
                columns={columns}
                pageCount={pageCount}
                onPaginationChange={handlePaginationChange}
                onFiltroAction={(e) => {
                    setIsLoading(true);
                    handleFiltroAction(e);
                    setIsLoading(false);
                }}
                modulo='bandeirasCliente'
                onEditAction={(e) => handleEdit(e)}
                onDeleteAction={(e) => handleDelete(e)}
                onViewAction={(e) => handleConfigureBandeira(e)}
                iconView={<Settings className="h-5 w-5"/>}
            />
            {(isAddModalOpen || editingBandeiraCliente) && (
                <BandeiraClienteModal
                    bandeiraClienteSelecionada={editingBandeiraCliente}
                    onSaveAction={editingBandeiraCliente ? handleEdit : handleAdd}
                    onCloseAction={() => {
                        setIsAddModalOpen(false)
                        setEditingBandeiraCliente(undefined)
                    }}
                    existingBandeiras={bandeirasCliente}
                    isOpen={isAddModalOpen}
                />
            )}
            {isImportModalOpen && (
                <ImportAlignmentModal
                    isOpen={isImportModalOpen}
                    onCloseAction={() => setIsImportModalOpen(false)}
                    onImportAction={handleImportAlignment}
                    currentClientName={'Cliente Atual'}
                />
            )}
            {(isBandeiraConfigModalOpen && editingBandeiraCliente) && (
                <BandeiraConfigModal
                    bandeiraCliente={editingBandeiraCliente}
                    isOpen={isBandeiraConfigModalOpen}
                    onCloseAction={handleCloseBandeiraConfigModal}
                    onSaveAction={handleSaveBandeiraConfig}
                />
            )}
        </div>
    )
}



