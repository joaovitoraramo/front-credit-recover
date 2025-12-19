"use client"

import {useState, useEffect} from "react"
import BancosTable from "@/app/cadastros/bancos/BancosTable"
import {Plus} from "lucide-react"
import type {Banco} from "@/types/banco"
import type {PaginationState} from "@tanstack/react-table"
import BancoModal from "@/app/cadastros/bancos/BancoModal"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {useLoading} from "@/context/LoadingContext";
import {lista, atualiza, deleta, cadastra} from "@/services/Banco";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function BancosPage() {
    useCheckPermission(1020, true);
    const [bancos, setBancos] = useState<Banco[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const {setIsLoading} = useLoading();

    const fetchBancos = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await lista(filtro);
        setBancos(retorno);
        setPageCount(Math.ceil(retorno.length / pagination.pageSize));
        setIsLoading(false);
    }

    useEffect(() => {
        fetchBancos(null);
    }, [pagination])

    const handleFiltroAction = async (filtro: any) => {
        await fetchBancos(filtro);
    }

    const handleEdit = async (editedBanco: Banco) => {
        const updated = await atualiza(editedBanco);
        setBancos(bancos.map((banco) => (banco.id === editedBanco.id ? updated : banco)));
    }

    const handleAddBanco = async (newBanco: Banco) => {
        const added = await cadastra(newBanco);
        setBancos([...bancos, added]);
        setIsAddModalOpen(false);
    }

    const handleDelete = async (deletedBanco: Banco) => {
        await deleta(deletedBanco);
        setBancos(bancos.filter((banco) => banco.id !== deletedBanco.id));
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho='h2'
                        titulo='Cadastro de Bancos'
                    />
                    {useCheckPermission(1021, false) && (
                        <BotaoPadrao
                            variant='outline'
                            name='Adicionar Banco'
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                        />
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <BancosTable
                        onFiltroAction={handleFiltroAction}
                        data={bancos}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onDeleteAction={handleDelete}
                    />
                </div>
            </div>
            <BancoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddBanco}
            />
        </div>
    )
}