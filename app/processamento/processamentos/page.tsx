"use client"

import {useState, useEffect, useCallback} from "react"
import {useRouter} from "next/navigation"
import ProcessamentosTable from "@/app/processamento/processamentos/ProcessamentosTable"
import FilterProcessamentosModal from "@/app/processamento/processamentos/FilterProcessamentosModal"
import ImportProcessamentosModal from "@/app/processamento/processamentos/ImportProcessamentosModal"
import {Processamento, ProcessamentoDTO, ProcessamentoFilter} from "@/types/processamento"
import type {PaginationState} from "@tanstack/react-table"
import {Search, Upload, Download, Plus, RefreshCcw} from "lucide-react"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import {useLoading} from "@/context/LoadingContext";
import {atualiza, cadastra, deleta, lista, reprocessar} from "@/services/Processamento";
import {useToast} from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import {IncludeProcessamentoModal} from "@/app/processamento/processamentos/IncludeProcessamentoModal";
import {useModalAvisoConfirmacao} from "@/context/ModalAvisoConfirmacaoContext";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function ProcessamentosPage() {
    const router = useRouter()
    const [processamentos, setProcessamentos] = useState<Processamento[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [filter, setFilter] = useState<ProcessamentoFilter>({
        bandeiraIds: [],
    })
    const [showFilter, setShowFilter] = useState(true)
    const [initialFilterDone, setInitialFilterDone] = useState(false)
    const [isFromDrawer, setIsFromDrawer] = useState(true)
    const [showImport, setShowImport] = useState(false)
    const {setIsLoading} = useLoading();
    const {toast} = useToast();
    const [atualizarLista, setAtualizarLista] = useState<boolean>(false);
    const [showInclude, setShowInclude] = useState(false);
    const {setIsOpen, setTitulo, setDescricao, confirmacao, setConfirmacao} = useModalAvisoConfirmacao();
    const [idDeleta, setIdDeleta] = useState<number | null>(null);

    useEffect(() => {
        if (filter.dataInicial || filter.dataFinal || filter.bandeiraIds.length > 0) {
            setIsFromDrawer(false)
        }
    }, [filter.dataInicial, filter.dataFinal, filter.bandeiraIds.length])

    const fetchProcessamentos = useCallback(async (pagination: PaginationState, processamentoFilter: ProcessamentoFilter) => {
        setIsLoading(true)
        const retorno = await lista({pagination, filter: processamentoFilter});
        setProcessamentos(retorno.content);
        setPageCount(retorno.totalPages);
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (!initialFilterDone) return
        fetchProcessamentos(pagination, filter)
    }, [pagination, initialFilterDone, filter, atualizarLista])

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

    const handleImportCancel = () => {
        setShowImport(false)
        setShowFilter(true)
    }

    const handleInclude = async (processamento: ProcessamentoDTO) => {
        if (!processamento) return
        const retorno = await cadastra(processamento);
        if (initialFilterDone) {
            setProcessamentos({
                ...processamentos,
                ...retorno
            })
        } else {
            let newFilter: ProcessamentoFilter = {
                dataInicial: processamento.dataTransacao,
                dataFinal: processamento.dataTransacao,
                clienteIds: [processamento.clienteId],
                bandeiraIds: [processamento.bandeiraId],
                semBandeira: false
            }
            handleFilter(newFilter)
        }
        setAtualizarLista(!atualizarLista)
        setShowInclude(true)
    }

    const handleExport = async () => {

        const wsData = processamentos.map((p) => [
            p.dataTransacao,
            p.horaTransacao,
            p.dataPagamento,
            p.nsuHost,
            p.cliente.nomeFantasia,
            p.bin,
            p.bandeira.nome,
            p.bandeira.tipo,
            p.qtdeParcelas,
            p.parcela,
            p.valorTotal,
            p.valorParcela,
            p.totalTaxa,
            p.valorLiquido,
            p.lancManual ? 'Sim' : 'Não',
        ]);

        const ws = XLSX.utils.aoa_to_sheet([
            [
                'Data Transação',
                'Hora Transação',
                'Data Pagamento',
                'Identificação',
                'Cliente',
                'Bin',
                'Bandeira',
                'Tipo',
                'Qtde Parcelas',
                'Parcela',
                'Valor Total',
                'Valor Parcela',
                'Total Taxa',
                'Valor Líquido',
                'Lanç. Manual',
            ],
            ...wsData,
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Processamentos');

        XLSX.writeFile(wb, 'processamentos.xlsx');
    };

    const handleFiltroAction = async (filtro: any) => {
        setFilter({
            ...filter,
            valorTotal: filtro.valorTotal,
            bin: filtro.bin,
        })
        await fetchProcessamentos(pagination, filter);
    }

    const handleEditProcessamentoAction = async (processamento: Processamento) => {

        const processamentoParaEnvio = {
            ...processamento,
            bandeira: { id: processamento.bandeira.id },
            cliente: { id: processamento.cliente.id }
        };

        // @ts-ignore <-- corrigir isso aqui kkkkkk, gambiarra so pra ir dormir
        const retorno = await atualiza(processamentoParaEnvio);
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
                    <TituloPadrao tamanho='h2' titulo='Processamentos'/>
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
                            </div>
                        )}
                        {useCheckPermission(1039, false) && (
                            <BotaoPadrao
                                variant="outline"
                                onClick={() => setShowImport(true)}
                                icon={<Upload className="w-4 h-4 font-bold"/>}
                                name={"Importar"}
                            />
                        )}
                        <BotaoPadrao
                            variant="outline"
                            onClick={handleExport}
                            icon={<Download className="w-4 h-4 font-bold"/>}
                            name={"Exportar"}
                        />
                        {useCheckPermission(1036, false) && (
                            <BotaoPadrao
                                variant="outline"
                                onClick={() => setShowInclude(true)}
                                icon={<Plus className="w-4 h-4 font-bold"/>}
                                name={"Incluir"}
                            />
                        )}

                    </div>
                </div>
                {initialFilterDone && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <ProcessamentosTable
                            data={processamentos}
                            pageCount={pageCount}
                            onPaginationChange={setPagination}
                            onDeleteProcessamento={handleDeleteProcessamentoAction}
                            onFiltroAction={handleFiltroAction}
                            onEditAction={handleEditProcessamentoAction}
                            onReprocessarAction={handleReprocessarVendas}
                        />
                    </div>
                )}
            </div>
            <FilterProcessamentosModal
                open={showFilter}
                onOpenChange={handleFilterCancel}
                initialFilter={filter}
                onFilter={handleFilter}
                onCancel={handleFilterCancel}
                onImportarAction={() => {
                    setShowFilter(false);
                    setShowImport(true);
                }}
                onIncluirAction={() => {
                    setShowFilter(false);
                    setShowInclude(true);
                }}
                initialFilterDone={initialFilterDone}
            />
            <ImportProcessamentosModal
                open={showImport}
                onOpenChange={(e) => {
                    setShowImport(e)
                    setShowFilter(true);
                }}
                onCancel={handleImportCancel}
            />
            <IncludeProcessamentoModal
                isOpen={showInclude}
                onCloseAction={() => {
                    setShowInclude(false);
                    if (!initialFilterDone) {
                        setShowFilter(true);
                    }
                }}
                onSaveAction={handleInclude}
            />
        </div>
    )
}

