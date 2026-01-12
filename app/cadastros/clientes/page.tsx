"use client"

import {useEffect, useRef, useState} from "react"
import ClientesTable from "@/app/cadastros/clientes/ClientesTable"
import {Plus} from "lucide-react"
import type {Client as Cliente, ClienteDTO} from "@/types/client"
import type {PaginationState} from "@tanstack/react-table"
import ClienteModal from "@/app/cadastros/clientes/ClienteModal"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {atualiza, cadastra, deleta, lista} from '@/services/Cliente';
import {useLoading} from "@/context/LoadingContext";
import {useToast} from "@/hooks/use-toast";
import {useCheckPermission} from "@/hooks/useCheckPermission";

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
    const {toast} = useToast();
    const [atualizarTabela, setAtualizarTabela] = useState<boolean>(false);
    const isFetchingRef = useRef(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const ultimoFiltroRef = useRef<any>(null);

    const fetchClients = async (filtro: any | null) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);

        try {
            const retorno = await lista(filtro, pagination);
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


    const debounceFetch = (filtro: any) => {
        ultimoFiltroRef.current = filtro;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchClients(ultimoFiltroRef.current);
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
        };
        const updated = await atualiza(put);
        toast({
            title: 'Clientes',
            description: 'Atualização de cliente realizada com sucesso.',
            className: 'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary bg-white',
        })
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
        }
        const added = await cadastra(post);
        toast({
            title: 'Clientes',
            description: 'Cadastro de cliente realizado com sucesso.',
            className: 'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary bg-white',
        })
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


    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2' titulo='Cadastro de Clientes'/>
                    {useCheckPermission(1033, false) && (
                        <BotaoPadrao
                            onClick={() => setIsAddModalOpen(true)}
                            name='Adicionar Cliente'
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                            variant='outline'
                        />
                    )}

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
            <ClienteModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAdd}
            />
        </div>
    )
}

