"use client"

import {useEffect, useRef, useState} from "react"
import ClientesTable from "@/app/cadastros/clientes/ClientesTable"
import {Filter, Layers, Plus, X} from "lucide-react"
import {Client as Cliente, ClienteDTO, STATUS_CLIENTE_LABEL, STATUS_ICONS, StatusCliente} from "@/types/client"
import type {PaginationState} from "@tanstack/react-table"
import ClienteModal from "@/app/cadastros/clientes/ClienteModal"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {atualiza, cadastra, deleta, listaPaginavel} from '@/services/Cliente';
import {useLoading} from "@/context/LoadingContext";
import {useCheckPermission} from "@/hooks/useCheckPermission";
import {useToast} from "@/components/toast/ToastProvider";

export default function ClientsPage() {
    useCheckPermission(1032, true);
    const [clients, setClients] = useState<Cliente[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const {setIsLoading} = useLoading();
    const [atualizarTabela, setAtualizarTabela] = useState<boolean>(false);
    const isFetchingRef = useRef(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const ultimoFiltroRef = useRef<any>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusFiltro, setStatusFiltro] = useState<StatusCliente | null>(null);
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
    const { showToast } = useToast();

    const fetchClients = async (filtro: any | null) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);

        try {
            const retorno = await listaPaginavel(filtro, pagination);
            setClients(retorno.content);
            setPageCount(retorno.totalPages);
            return retorno;
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
        }
    };

    const filtroValido = (filtro: any) => {
        if (!filtro) return false;

        return Object.values(filtro).some(
            (v) => v !== null && v !== undefined && String(v).trim() !== ""
        );
    };

    const handleLimparFiltros = async () => {
        ultimoFiltroRef.current = null;
        setStatusFiltro(null);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));

        await fetchClients(null);
    };

    const aplicarFiltroStatus = async () => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));

        await fetchClients(buildFiltro());
    };

    const buildFiltro = (override?: Record<string, any>) => {
        return {
            ...(ultimoFiltroRef.current ?? {}),
            ...(override ?? {}),
            status: statusFiltro,
        };
    };

    const debounceFetch = (novoFiltro: any) => {
        ultimoFiltroRef.current = {
            ...(ultimoFiltroRef.current ?? {}),
            ...novoFiltro,
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchClients(buildFiltro());
        }, 500);
    };

    useEffect(() => {
        fetchClients(ultimoFiltroRef.current);
    }, [pagination.pageIndex, pagination.pageSize, atualizarTabela]);

    const handleEdit = async (edited: Cliente) => {
        let put: Partial<ClienteDTO> = {
            id: edited.id,
            razaoSocial: edited.razaoSocial,
            nomeFantasia: edited.nomeFantasia,
            endereco: edited.endereco,
            cep: edited.cep,
            celular: edited.celular,
            telefone: edited.telefone,
            email: edited.email,
            emailSecundario: edited.emailSecundario,
            pdvs: edited.pdvs,
            pos: edited.pos,
            contabilidadeId: edited.contabilidade ? edited.contabilidade.id : undefined,
            regimeTributario: edited.regimeTributario,
            erp: edited.erp,
            tef: edited.tef,
            linkSitef: edited.linkSitef,
            senhaSitef: edited.senhaSitef,
            loginSitef: edited.loginSitef,
            bandeirasCliente: edited.bandeirasCliente.map(bandeira => ({
                id: bandeira.id,
                agencia: bandeira.agencia && bandeira.agencia,
                conta: bandeira.conta,
                clienteId: edited.id,
                bandeiraId: bandeira.bandeira?.id,
                bancoId: bandeira.banco?.id,
                adquirenteId: bandeira.adquirente?.id,
                diasPagamento: bandeira.diasPagamento,
                diaFixo: bandeira.diaFixo,
                diaSemanaCorte: bandeira.diaSemanaCorte,
                bandeirasConfig: bandeira.bandeirasConfig || [],
                deleta: bandeira.deleta,
                encargos: bandeira.encargos
            })),
            adicionais: edited.adicionais,
            status: edited.status
        };
        const updated = await atualiza(put);
        showToast("Atualização de cliente realizada com sucesso.", "success");
        setClients(clients.map((client) => (client.id === updated.id ? updated : client)))
        setAtualizarTabela(!atualizarTabela);
    }

    const handleDelete = async (deleted: Cliente) => {
        await deleta(deleted);
        setClients(clients.filter(c => c.id !== deleted.id));
        setAtualizarTabela(!atualizarTabela);
    }

    const handleAdd = async (newObjeto: Cliente) => {
        let post: Partial<ClienteDTO> = {
            cnpj: newObjeto.cnpj,
            razaoSocial: newObjeto.razaoSocial,
            nomeFantasia: newObjeto.nomeFantasia,
            endereco: newObjeto.endereco,
            cep: newObjeto.cep,
            celular: newObjeto.celular,
            telefone: newObjeto.telefone,
            email: newObjeto.email,
            emailSecundario: newObjeto.emailSecundario,
            pdvs: newObjeto.pdvs,
            pos: newObjeto.pos,
            contabilidadeId: newObjeto.contabilidade ? newObjeto.contabilidade.id : undefined,
            regimeTributario: newObjeto.regimeTributario,
            erp: newObjeto.erp,
            tef: newObjeto.tef,
            linkSitef: newObjeto.linkSitef,
            senhaSitef: newObjeto.senhaSitef,
            loginSitef: newObjeto.loginSitef,
            bandeirasCliente: newObjeto.bandeirasCliente.map(bandeira => ({
                agencia: bandeira.agencia && bandeira.agencia,
                conta: bandeira.conta,
                bandeiraId: bandeira.bandeira?.id,
                bancoId: bandeira.banco?.id,
                adquirenteId: bandeira.adquirente?.id,
                diasPagamento: bandeira.diasPagamento,
                diaFixo: bandeira.diaFixo,
                diaSemanaCorte: bandeira.diaSemanaCorte,
                bandeirasConfig: bandeira.bandeirasConfig || [],
                encargos: bandeira.encargos
            })),
            adicionais: newObjeto.adicionais,
            status: newObjeto.status
        }
        const added = await cadastra(post);
        showToast("Cadastro de cliente realizado com sucesso.", "success");
        setClients([...clients, added])
        setIsAddModalOpen(false)
        setAtualizarTabela(!atualizarTabela);
    }

    const handleFiltroAction = async (filtro: any) => {
        if (!filtroValido(filtro)) {
            return;
        }
        debounceFetch(filtro);
    }

    const openStatusModal = () => {
        setIsStatusModalVisible(true);
        requestAnimationFrame(() => {
            setIsStatusModalOpen(true);
        });
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setTimeout(() => {
            setIsStatusModalVisible(false);
        }, 200); // mesmo tempo da animação
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho="h2" titulo="Cadastro de Clientes" />

                    <div className="flex items-center gap-2">
                        {ultimoFiltroRef.current !== null && (
                            <BotaoPadrao
                                onClick={handleLimparFiltros}
                                name="Limpar filtros"
                                variant="ghost"
                                icon={<X className="h-4 w-4 mr-2" />}
                            />
                        )}
                        <BotaoPadrao
                            icon={<Filter className="h-5 w-5 mr-2" />}
                            onClick={openStatusModal}
                            name="Status"
                            variant="outline"
                        />
                        {useCheckPermission(1033, false) && (
                            <BotaoPadrao
                                onClick={() => setIsAddModalOpen(true)}
                                name="Adicionar Cliente"
                                icon={<Plus className="h-5 w-5 mr-2" />}
                                variant="outline"
                            />
                        )}
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <ClientesTable
                        data={clients}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onFiltroAction={handleFiltroAction}
                        onDeleteAction={handleDelete}
                    />
                </div>
            </div>
            {isStatusModalVisible && (
                <div
                    className={`
            fixed inset-0 z-50 flex items-center justify-center
            bg-black/40
            transition-opacity duration-200
            ${isStatusModalOpen ? "opacity-100" : "opacity-0"}
        `}
                    onClick={closeStatusModal}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`
                bg-white rounded-xl shadow-2xl w-[380px] p-6
                transform transition-all duration-200
                ${isStatusModalOpen
                            ? "scale-100 opacity-100"
                            : "scale-95 opacity-0"}
            `}
                    >
                        <h3 className="text-lg font-semibold mb-1">
                            Filtrar por status
                        </h3>

                        <p className="text-sm text-gray-500 mb-4">
                            Selecione um status para filtrar os clientes
                        </p>

                        <div className="space-y-3">
                            {/* TODOS */}
                            <div
                                onClick={() => setStatusFiltro(null)}
                                className={`
                        group cursor-pointer rounded-lg border
                        p-3 flex items-center justify-between
                        transition-all
                        ${statusFiltro === null
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-gray-200 hover:shadow-md hover:-translate-y-[1px]"}
                    `}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`
                                h-9 w-9 rounded-md flex items-center justify-center
                                ${statusFiltro === null
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}
                            `}
                                    >
                                        <Layers className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Todos</p>
                                        <p className="text-xs text-gray-500">
                                            Mostrar todos os clientes
                                        </p>
                                    </div>
                                </div>

                                <input
                                    type="radio"
                                    checked={statusFiltro === null}
                                    onChange={() => setStatusFiltro(null)}
                                    className="accent-primary"
                                />
                            </div>

                            <div className="h-px bg-gray-200" />

                            {/* STATUS DINÂMICOS */}
                            {Object.entries(STATUS_CLIENTE_LABEL).map(([value, label]) => {
                                const status = value as StatusCliente;
                                const selected = statusFiltro === status;
                                const Icon = STATUS_ICONS[status];

                                return (
                                    <div
                                        key={status}
                                        onClick={() => setStatusFiltro(status)}
                                        className={`
                                group cursor-pointer rounded-lg border
                                p-3 flex items-center justify-between
                                transition-all
                                ${selected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-gray-200 hover:shadow-md hover:-translate-y-[1px]"}
                            `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`
                                        h-9 w-9 rounded-md flex items-center justify-center
                                        ${selected
                                                    ? "bg-primary text-white"
                                                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}
                                    `}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {label}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Status {label.toLowerCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <input
                                            type="radio"
                                            checked={selected}
                                            onChange={() => setStatusFiltro(status)}
                                            className="accent-primary"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <BotaoPadrao
                                name="Cancelar"
                                variant="ghost"
                                onClick={closeStatusModal}
                            />

                            <BotaoPadrao
                                name="Aplicar filtro"
                                variant="outline"
                                onClick={() => {
                                    aplicarFiltroStatus();
                                    closeStatusModal();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}


            <ClienteModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAdd}
            />
        </div>
    )
}

