"use client"

import {useState, useEffect} from "react"
import ContabilidadesTable from "@/app/cadastros/contabilidades/ContabilidadesTable"
import {Plus} from "lucide-react"
import type {Contabilidade} from "@/types/contabilidade"
import type {PaginationState} from "@tanstack/react-table"
import ContabilidadeModal from "@/app/cadastros/contabilidades/ContabilidadeModal"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {useLoading} from "@/context/LoadingContext";
import {lista, cadastra, atualiza, deleta} from "@/services/Contabilidade";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function ContabilidadesPage() {
    useCheckPermission(1028, true);
    const [contabilidades, setContabilidades] = useState<Contabilidade[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const {setIsLoading} = useLoading();

    const fetchContabilidades = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await lista(filtro);
        setContabilidades(retorno)
        setPageCount(Math.ceil(retorno.length / pagination.pageSize))
        setIsLoading(false);
    }

    useEffect(() => {
        fetchContabilidades(null);
    }, [pagination])

    const handleEdit = async (editedContabilidade: Contabilidade) => {
        const updated = await atualiza(editedContabilidade)
        setContabilidades(contabilidades.map((contabilidade) => (contabilidade.id === updated.id ? updated : contabilidade)))
    }

    const handleDelete = async (deletedContabilidade: Contabilidade) => {
        await deleta(deletedContabilidade);
        setContabilidades(contabilidades.filter(c => c.id !== deletedContabilidade.id));
    }

    const handleAdd = async (newObjeto: Contabilidade) => {
        let post: Partial<Contabilidade> = {
            cnpj: newObjeto.cnpj,
            razaoSocial: newObjeto.razaoSocial,
            nomeFantasia: newObjeto.nomeFantasia,
            ie: newObjeto.ie,
            email: newObjeto.email,
        }
        const added = await cadastra(post);
        setContabilidades([...contabilidades, added])
        setIsAddModalOpen(false)
    }

    const handleFiltroAction = async (filtro: any) => {
        await fetchContabilidades(filtro);
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho='h2'
                        titulo='Cadastro de Contabilidades'
                    />
                    {useCheckPermission(1029, false) && (
                        <BotaoPadrao
                            variant='outline'
                            name='Adicionar Contabilidade'
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                        />
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <ContabilidadesTable
                        data={contabilidades}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onFiltroAction={handleFiltroAction}
                        onDeleteAction={handleDelete}
                    />
                </div>
            </div>
            <ContabilidadeModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAdd}
            />
        </div>
    )
}

