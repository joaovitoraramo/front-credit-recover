"use client"

import {useState, useEffect, useCallback} from "react"
import {useRouter} from "next/navigation"
import LotesTable from "@/app/processamento/lotes/LotesTable"
import FilterLotesModal from "@/app/processamento/lotes/FilterLotesModal"
import {Processamento, ProcessamentoFilter} from "@/types/processamento"
import type {PaginationState} from "@tanstack/react-table"
import {Search, RefreshCcw, Loader2, FileDown, Download} from "lucide-react"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import {useLoading} from "@/context/LoadingContext";
import {useToast} from "@/hooks/use-toast";
import {LoteReadDTO} from "@/types/lote";
import {lista} from "@/services/Lote";
import {
    aplicarEncargosLote, atualiza,
    baixar, deleta,
    lista as listaProcessamentos,
    reprocessar,
    reprocessarPorLote,
    reverterBaixa, transferirLote, transferirProcessamento
} from "@/services/Processamento";
import ProcessamentosTable from "@/app/processamento/processamentos/ProcessamentosTable";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import TransferLotesModal from "@/app/processamento/lotes/TransferLotesModal";
import EncargosLoteModal from "@/app/processamento/lotes/EncargosLoteModal";
import {useModalAvisoConfirmacao} from "@/context/ModalAvisoConfirmacaoContext";
import TransferProcessamentoModal from "@/app/processamento/lotes/TransferProcessamentoModal";
import {ExportColumn, ExportStatus} from "@/types/export";
import {downloadExcel} from "@/components/Util/utils";
import ModalExportar from "@/components/ModalExportar";

export default function LotesPage() {
    const router = useRouter()
    const [lotes, setLotes] = useState<LoteReadDTO[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [pageCountProcessamentos, setPageCountProcessamentos] = useState(0)
    const [paginationProcessamentos, setPaginationProcessamentos] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [filter, setFilter] = useState<ProcessamentoFilter>({
        bandeiraIds: [],
        dataDePagamento: true,
    })
    const [showFilter, setShowFilter] = useState(true)
    const [initialFilterDone, setInitialFilterDone] = useState(false)
    const [isFromDrawer, setIsFromDrawer] = useState(true)
    const {setIsLoading} = useLoading();
    const {toast} = useToast();
    const [atualizarLista, setAtualizarLista] = useState<boolean>(false);
    const [processamentos, setProcessamentos] = useState<Processamento[]>([]);
    const [isProcessamentosModalOpen, setIsProcessamentosModalOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState<LoteReadDTO | null>(null);
    const [openModalTransferir, setOpenModalTransferir] = useState<boolean>(false);
    const [lotesTransferir, setLotesTransferir] = useState<LoteReadDTO[]>([]);
    const [openModalTransferirProcessamentos, setOpenModalTransferirProcessamentos] = useState<boolean>(false);
    const [processamentosTransferir, setProcessamentosTransferir] = useState<Processamento[]>([]);
    const [lotesEncargos, setLotesEncargos] = useState<LoteReadDTO[]>([]);
    const [openModalEncargos, setOpenModalEncargo] = useState<boolean>(false);
    const {setIsOpen, setTitulo, setDescricao, confirmacao, setConfirmacao} = useModalAvisoConfirmacao();
    const [idDeleta, setIdDeleta] = useState<number | null>(null);
    const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
    const [exportData, setExportData] = useState<LoteReadDTO[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilter, setExportFilter] = useState<ProcessamentoFilter | null>(null);
    const [exportColumns, setExportColumns] = useState<ExportColumn<LoteReadDTO>[]>([]);

    useEffect(() => {
        if (filter.dataInicial || filter.dataFinal || filter.bandeiraIds.length > 0) {
            setIsFromDrawer(false)
        }
    }, [filter.dataInicial, filter.dataFinal, filter.bandeiraIds.length])

    const fetchLotes = useCallback(async (pagination: PaginationState, processamentoFilter: ProcessamentoFilter) => {
        setIsLoading(true)
        const retorno = await lista({pagination, filter: processamentoFilter});
        setLotes(retorno.content);
        setPageCount(retorno.totalPages);
        setIsLoading(false)
    }, [])

    const fetchProcessamentos = useCallback(async (pagination: PaginationState, processamentoFilter: ProcessamentoFilter) => {
        setIsLoading(true)
        const retorno = await listaProcessamentos({pagination, filter: processamentoFilter});
        setProcessamentos(retorno.content);
        setPageCountProcessamentos(retorno.totalPages);
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (!initialFilterDone) return
        fetchLotes(pagination, filter)
        if (isProcessamentosModalOpen && selectedLote) {
            const filtro: ProcessamentoFilter = {
                bandeiraIds: [],
                loteId: selectedLote.id,
                semBandeira: false
            }
            fetchProcessamentos(paginationProcessamentos, filtro)
        }
    }, [pagination, initialFilterDone, filter, atualizarLista])

    const handleViewProcessamentos = (lote: LoteReadDTO) => {
        const filter: ProcessamentoFilter = {
            bandeiraIds: [],
            loteId: lote.id,
            semBandeira: false
        }
        fetchProcessamentos(paginationProcessamentos, filter)
        setIsProcessamentosModalOpen(true);
        setSelectedLote(lote)
    }

    const handleTransferirProcessamento = (processamento: Processamento[])=> {
        setProcessamentosTransferir(processamento);
        setOpenModalTransferirProcessamentos(true);
    }

    const handleFilter = (newFilter: ProcessamentoFilter) => {
        setFilter(newFilter)
        setInitialFilterDone(true)
        setShowFilter(false)
        setIsFromDrawer(false)
    }

    const handleFilterCancel = () => {
        if (isFromDrawer) {
            router.push("/principal")
        } else {
            setShowFilter(false)
        }
    }

    const handleFiltroAction = async (filtro: any) => {
        setFilter({
            ...filter,
            valorTotal: filtro.valorTotal !== '' ? filtro.valorTotal : null,
            bin: filtro.bin !== '' ? filtro.bin : null,
            bandeira: filtro.bandeira !== '' ? filtro.bandeira : null,
            valorLiquido: filtro.valorLiquido !== '' ? filtro.valorLiquido : null,
            valorTransacao: filtro.valorTransacao !== '' ? filtro.valorTransacao : null,
            valorTaxa: filtro.valorTaxa !== '' ? filtro.valorTaxa : null,
            taxa: filtro.taxa !== '' ? filtro.taxa : null,
        });
        await fetchLotes(pagination, filter);
    }

    const handleOnBaixarLoteAction = async (lote: LoteReadDTO[]) => {
        const ids = lote.map(lote => lote.id);
        await baixar(ids, "lote");
        setAtualizarLista(!atualizarLista);
    }

    const handleOnBaixarProcessamentoAction = async (processamento: Processamento[]) => {
        await baixar(processamento.map(processamento => processamento.id), "processamento");
        setAtualizarLista(!atualizarLista);
    }

    const handleOnReverterBaixaProcessamentoAction = async (processamento: Processamento[]) => {
        await reverterBaixa(processamento.map(processamento => processamento.id), "processamento");
        setAtualizarLista(!atualizarLista);
    }

    const handleReprocessarVendasLotes = async (lote: LoteReadDTO[]) => {
        await reprocessarPorLote(lote.map(e => e.id));
        setAtualizarLista(!atualizarLista);
    }

    const handleReverterBaixa = async (lote: LoteReadDTO[]) => {
        await reverterBaixa(lote.map(e => e.id), 'lote');
        setAtualizarLista(!atualizarLista);
    }

    const handleTransferir = async (data: string) => {
        await transferirLote(lotesTransferir.map(e => e.id), data);
        setAtualizarLista(!atualizarLista);
    }

    const handleEnviarTransferirProcessamento = async (data: string) => {
        await transferirProcessamento(processamentosTransferir.map(e => e.id), data, processamentosTransferir[0].cliente.id);
        setAtualizarLista(!atualizarLista);
    }

    const handleApplyEncargos = async (loteEncargos: LoteReadDTO) => {
        const loteEncargosAtualizado: LoteReadDTO = {
            ...loteEncargos,
            encargos: loteEncargos.encargos.map((encargo) => ({
                ...encargo,
                id: encargo.id && encargo.id > 0 ? encargo.id : null,
            })),
        };

        await aplicarEncargosLote(loteEncargosAtualizado);
        setAtualizarLista(!atualizarLista);
    }

    const handleReprocessarVendas = async (processamentos: Processamento[]) => {
        const idsProcessamentos = processamentos.map(processamento => processamento.id);
        const retorno = await reprocessar(idsProcessamentos);
        if (retorno.status === 'OK') {
            toast({
                title: 'Processamentos',
                description: retorno.mensagem,
                className: 'p-4 relative bg-[#808080] flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary',
            })
            setAtualizarLista(!atualizarLista);
        }
    }

    const handleEditProcessamentoAction = async (processamento: Processamento) => {
        const retorno = await atualiza(processamento);
        setProcessamentos(processamentosAnteriores => {
            return processamentosAnteriores.map(item => {
                if (item.id === retorno.id) {
                    return retorno;
                }
                return item;
            });
        });
        setAtualizarLista(!atualizarLista);
        toast({
            title: 'Processamentos',
            description: 'Atualização de registro de venda realizada com sucesso.',
            className: 'p-4 relative bg-[#808080] flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary',
        })
    }

    const handleDeleteProcessamentoAction = async (id: number) => {
        setIdDeleta(id);
        setTitulo('Aviso')
        setDescricao('Deseja realmente deletar esse processamento? Essa ação não pode ser desfeita.');
        setIsOpen(true);
    }

    const onDeleteAction = async () => {
        if (idDeleta) {
            await deleta(idDeleta);
            setIdDeleta(null);
            toast({
                title: 'Processamentos',
                description: 'Processamento deletado com sucesso.',
                className: 'p-4 relative bg-[#808080] flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary',
            })
            setAtualizarLista(!atualizarLista);
        }
    }

    const handleDownloadExcel = () => {
        const success = downloadExcel<LoteReadDTO>(
            exportData,
            exportColumns
        );

        if (success) {
            setExportStatus('idle');
            setExportData([]);
        }
    }

    const handleExportFilter = async (filtro: ProcessamentoFilter) => {
        setShowExportModal(false);
        setExportStatus('loading');

        try {
            const allData: LoteReadDTO[] = [];

            const firstResponse = await lista({
                pagination: {
                    pageIndex: 0,
                    pageSize: 100000,
                },
                filter: filtro,
            });

            allData.push(...firstResponse.content);

            const totalPages = firstResponse.totalPages;

            for (let page = 1; page < totalPages; page++) {
                const response = await lista({
                    pagination: {
                        pageIndex: page,
                        pageSize: 100000,
                    },
                    filter: filtro,
                });

                allData.push(...response.content);
            }

            setExportData(allData);
            setExportFilter(filtro);
            setExportStatus('ready');
        } catch (error) {
            console.error('Erro ao exportar lotes', error);
            setExportStatus('error');
        }
    };

    useEffect(() => {
        if (confirmacao) {
            onDeleteAction();
            setConfirmacao(false);
        }
    }, [confirmacao])

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2' titulo='Lotes'/>
                    <div className="flex gap-2">
                        {initialFilterDone && (
                            <div>
                                <BotaoPadrao
                                    variant="outline"
                                    onClick={() => setShowFilter(true)}
                                    icon={<Search className="w-4 h-4 font-bold"/>}
                                    name={"Filtrar"}
                                />
                                <BotaoPadrao
                                    variant="outline"
                                    onClick={() => setAtualizarLista(!atualizarLista)}
                                    icon={<RefreshCcw className="w-4 h-4 font-bold"/>}
                                    name={"Atualizar"}
                                />
                                <BotaoPadrao
                                    icon={
                                        exportStatus === 'loading' ? (
                                            <Loader2 className="animate-spin" />
                                        ) : exportStatus === 'ready' ? (
                                            <FileDown />
                                        ) : (
                                            <Download />
                                        )
                                    }
                                    name={
                                        exportStatus === 'loading'
                                            ? 'Processando...'
                                            : exportStatus === 'ready'
                                                ? 'Baixar Excel'
                                                : 'Exportar'
                                    }
                                    variant={
                                        exportStatus === 'ready'
                                            ? 'outline'
                                            : exportStatus === 'loading'
                                                ? 'destructive'
                                                : 'outline'
                                    }
                                    className={
                                        exportStatus === 'ready'
                                            ? `
                                      bg-green-600
                                      text-white
                                      border-green-600
                                      hover:bg-green-700
                                      hover:border-green-700
                                      shadow-md
                                      hover:shadow-lg
                                      transition-all
                                    `
                                            : exportStatus === 'loading'
                                                ? `
                                        bg-yellow-100
                                        text-yellow-800
                                        border-yellow-300
                                        cursor-wait
                                        opacity-90
                                      `
                                                : `
                                        transition-all
                                        hover:shadow-sm
                                      `
                                    }
                                    disabled={exportStatus === 'loading'}
                                    onClick={() => {
                                        if (exportStatus === 'ready') {
                                            handleDownloadExcel();
                                        } else {
                                            setShowExportModal(true);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {initialFilterDone && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <LotesTable
                            data={lotes}
                            pageCount={pageCount}
                            onPaginationChange={setPagination}
                            onFiltroAction={handleFiltroAction}
                            onViewProcessamentosAction={handleViewProcessamentos}
                            onBaixarAction={handleOnBaixarLoteAction}
                            onReprocessarTodasAction={handleReprocessarVendasLotes}
                            onReverterBaixaAction={handleReverterBaixa}
                            onTransferirAction={(e) => {
                                setLotesTransferir(e);
                                setOpenModalTransferir(true);
                            }}
                            onEncargosAction={(e) => {
                                setLotesEncargos(e);
                                setOpenModalEncargo(true);
                            }}
                            onExportColumnsChange={setExportColumns}
                        />
                    </div>
                )}
            </div>
            {initialFilterDone && (
                <ModalExportar
                    open={showExportModal}
                    onOpenChange={setShowExportModal}
                    initialFilter={filter}
                    onConfirm={handleExportFilter}
                    titulo={'Lotes'}
                />
            )}
            <FilterLotesModal
                open={showFilter}
                onOpenChange={handleFilterCancel}
                initialFilter={filter}
                onFilter={handleFilter}
                onCancelAction={handleFilterCancel}
                initialFilterDone={initialFilterDone}
            />
            <Dialog open={isProcessamentosModalOpen} onOpenChange={setIsProcessamentosModalOpen}>
                <DialogContent className="overflow-auto max-w-[200vh] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Processamentos do Lote {selectedLote?.id}</DialogTitle>
                    </DialogHeader>
                    {processamentos && (
                        <ProcessamentosTable
                            data={processamentos}
                            pageCount={pageCountProcessamentos}
                            onPaginationChange={setPaginationProcessamentos}
                            onEditAction={handleEditProcessamentoAction}
                            onDeleteProcessamento={handleDeleteProcessamentoAction}
                            onFiltroAction={(e) => null}
                            disableFilter
                            onReprocessarAction={handleReprocessarVendas}
                            onBaixarAction={handleOnBaixarProcessamentoAction}
                            onReverterBaixaAction={handleOnReverterBaixaProcessamentoAction}
                            onTransferirProcessamentoAction={handleTransferirProcessamento}
                            isFromLotes
                        />
                    )}
                </DialogContent>
            </Dialog>
            <TransferLotesModal
                open={openModalTransferir}
                onOpenChange={() => setOpenModalTransferir(false)}
                lotes={lotesTransferir}
                onTransfer={handleTransferir}
            />
            <TransferProcessamentoModal
                open={openModalTransferirProcessamentos}
                onOpenChange={() => setOpenModalTransferirProcessamentos(false)}
                processamento={processamentosTransferir}
                onTransfer={handleEnviarTransferirProcessamento}
            />
            <EncargosLoteModal
                open={openModalEncargos}
                onOpenChange={() => setOpenModalEncargo(false)}
                lotes={lotesEncargos}
                onApplyEncargos={handleApplyEncargos}
            />
        </div>
    )
}

