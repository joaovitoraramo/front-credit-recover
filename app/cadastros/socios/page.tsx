"use client"

import {useState, useEffect} from "react"
import SociosTable from "@/app/cadastros/socios/SociosTable"
import {Plus} from "lucide-react"
import type {Socio, SocioDTO} from "@/types/socio"
import type {PaginationState} from "@tanstack/react-table"
import SocioModal from "@/app/cadastros/socios/SocioModal"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {lista, cadastra, cadastraArquivos, atualiza, deleta} from '@/services/Socio';
import {useLoading} from "@/context/LoadingContext";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function SociosPage() {
    useCheckPermission(1024, true);
    const [socios, setSocios] = useState<Socio[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const {setIsLoading} = useLoading();

    const fetchSocios = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await lista(filtro);
        setSocios(retorno)
        setPageCount(Math.ceil(retorno.length / pagination.pageSize))
        setIsLoading(false);
    }

    useEffect(() => {
        fetchSocios(null)
    }, [pagination])

    const handleFiltroAction = async (filtro: any) => {
        await fetchSocios(filtro);
    }

    const handleEdit = async (editedSocio: Socio) => {
        const put: Partial<SocioDTO> = {
            id: editedSocio.id,
            cpf: editedSocio.cpf,
            nome: editedSocio.nome,
            rg: editedSocio.rg,
            dataNascimento: editedSocio.dataNascimento,
            clientesId: editedSocio.clientes
                ?.filter(cliente => cliente != null)
                .filter(cliente => cliente.id != null)
                .map(cliente => cliente.id),
            nomePai: editedSocio.nomePai,
            nomeMae: editedSocio.nomeMae
        }
        const edited = await atualiza(put);
        if (editedSocio.documento || editedSocio.contratoLgpd || editedSocio.contratoSocial) {
            const retornoArquivos = await cadastraArquivos(edited.id, editedSocio.contratoSocial, editedSocio.contratoLgpd, editedSocio.documento);
            setSocios(socios.map((socio) => (socio.id === editedSocio.id ? retornoArquivos : socio)));
        } else {
            setSocios(socios.map((socio) => (socio.id === editedSocio.id ? edited : socio)));
        }
    }

    const handleAddSocio = async (newSocio: Socio) => {
        const post: Partial<SocioDTO> = {
            cpf: newSocio.cpf,
            nome: newSocio.nome,
            rg: newSocio.rg,
            dataNascimento: newSocio.dataNascimento,
            clientesId: newSocio.clientes?.map(cliente => cliente.id),
            nomePai: newSocio.nomePai,
            nomeMae: newSocio.nomeMae
        }
        const added: Socio = await cadastra(post);
        const retornoArquivos = await cadastraArquivos(added.id, newSocio.contratoSocial, newSocio.contratoLgpd, newSocio.documento);
        setSocios([...socios, retornoArquivos])
        setIsAddModalOpen(false)
    }

    const handleDeleteSocio = async (deletedSocio: Socio) => {
        await deleta(deletedSocio);
        setSocios(socios.filter(socio => socio.id !== deletedSocio.id));
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho='h2'
                        titulo='Cadastro de Sócios'
                    />
                    {useCheckPermission(1025, false) && (
                        <BotaoPadrao
                            variant='outline'
                            name='Adicionar Sócio'
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                        />
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <SociosTable
                        data={socios}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onDeleteAction={handleDeleteSocio}
                        onFiltroAction={handleFiltroAction}
                    />
                </div>
            </div>
            <SocioModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAddSocio}/>
        </div>
    )
}

