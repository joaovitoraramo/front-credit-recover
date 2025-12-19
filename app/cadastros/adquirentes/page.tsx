"use client"

import {useState, useEffect} from "react"
import AdquirentesTable from "@/app/cadastros/adquirentes/AdquirentesTable"
import {Plus} from "lucide-react"
import type {Adquirente} from "@/types/adquirente"
import type {PaginationState} from "@tanstack/react-table"
import AdquirenteModal from "@/app/cadastros/adquirentes/AdquirenteModal"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {useLoading} from "@/context/LoadingContext";
import {lista, atualiza, deleta, cadastra} from "@/services/Adquirente";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function AdquirentesPage() {
    useCheckPermission(1012, true);
    const [adquirentes, setAdquirentes] = useState<Adquirente[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const {setIsLoading} = useLoading();

    const fetchAdquirentes = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await lista(filtro);
        setAdquirentes(retorno)
        setPageCount(Math.ceil(retorno.length / pagination.pageSize))
        setIsLoading(false);
    }

    useEffect(() => {
        fetchAdquirentes(null);
    }, [pagination])

    const handleFiltroAction = async (filtro: any) => {
        await fetchAdquirentes(filtro);
    }

    const handleEdit = async (editedAdquirente: Adquirente) => {
        const updated = await atualiza(editedAdquirente);
        setAdquirentes(
            adquirentes.map((adquirente) => (adquirente.id === editedAdquirente.id ? updated : adquirente)),
        )
    }

    const handleAddAdquirente = async (newAdquirente: Adquirente) => {
        const added = await cadastra(newAdquirente);
        setAdquirentes([...adquirentes, added])
        setIsAddModalOpen(false)
    }

    const handleDelete = async (deletedAdquirente: Adquirente) => {
        await deleta(deletedAdquirente);
        setAdquirentes(adquirentes.filter((adquirente) => adquirente.id !== deletedAdquirente.id))
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho='h2'
                        titulo='Cadastro de Adquirentes'
                    />
                    {useCheckPermission(1013, false) && (
                        <BotaoPadrao
                            variant='outline'
                            name='Adicionar Adquirente'
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                        />
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <AdquirentesTable
                        onFiltroAction={handleFiltroAction}
                        data={adquirentes}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onDeleteAction={handleDelete}
                    />
                </div>
            </div>
            <AdquirenteModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAddAdquirente}
            />
        </div>
    )
}

