"use client"

import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {Plus} from "lucide-react";
import {useEffect, useState} from "react";
import {useLoading} from "@/context/LoadingContext";
import {atualiza, lista, cadastra, deleta} from "@/services/Perfil";
import {IPerfil, IPerfilDTO} from "@/types/perfil";
import type {PaginationState} from "@tanstack/react-table";
import PerfisTable from "./PerfisTable";
import PerfisModal from "@/app/cadastros/perfis/PerfisModal";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function PerfisPage() {
    useCheckPermission(1004, true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const {setIsLoading} = useLoading();
    const [perfis, setPerfis] = useState<IPerfil[]>([]);
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [atualizarLista, setAtualizarLista] = useState<boolean>(false);

    const fetchPerfis = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await lista(filtro);
        setPerfis(retorno)
        setPageCount(Math.ceil(retorno.length / pagination.pageSize))
        setIsLoading(false);
    }

    useEffect(() => {
        fetchPerfis(null)
    }, [pagination, atualizarLista])

    const handleAdd = async (newObjeto: IPerfil) => {
        const post: Partial<IPerfilDTO> = {
            nome: newObjeto.nome,
            permissoes: newObjeto.permissoes.map(permissoes => permissoes.tag),
        }
        const added: IPerfil = await cadastra(post);
        setPerfis([...perfis, added])
        setIsAddModalOpen(false)
        setAtualizarLista(!atualizarLista)
    }

    const handleEdit = async (editedObjeto: IPerfil) => {
        const put: Partial<IPerfilDTO> = {
            id: editedObjeto.id,
            nome: editedObjeto.nome,
            permissoes: editedObjeto.permissoes.map(permissoes => permissoes.tag),
        }
        const added: IPerfil = await atualiza(put);
        setPerfis([...perfis, added])
        setIsAddModalOpen(false)
        setAtualizarLista(!atualizarLista)
    }

    const handleDeleteSocio = async (deleted: IPerfil) => {
        await deleta(deleted);
        setPerfis(perfis.filter(perfil => perfil.id !== deleted.id));
    }

    const handleFiltroAction = async (filtro: any) => {
        await fetchPerfis(filtro);
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho='h2'
                        titulo='Cadastro de Perfis'
                    />
                    {useCheckPermission(1005, false) && (
                        <BotaoPadrao
                            variant='outline'
                            name='Adicionar Perfil'
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                        />
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <PerfisTable
                        data={perfis}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onDeleteAction={handleDeleteSocio}
                        onFiltroAction={handleFiltroAction}
                    />
                </div>
            </div>
            <PerfisModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAdd}
            />
        </div>
    )
}