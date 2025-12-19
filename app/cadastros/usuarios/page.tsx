"use client"

import {useState, useEffect} from "react"
import UsuariosTable from "@/app/cadastros/usuarios/UsuariosTable"
import {Plus} from "lucide-react"
import type {Usuario, UsuarioDTO} from "@/types/usuario"
import type {PaginationState} from "@tanstack/react-table"
import UsuarioModal from "@/app/cadastros/usuarios/UsuarioModal"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {atualizaUsuario, cadastraUsuario, getListaUsuarios} from "@/services/Usuario";
import {useLoading} from "@/context/LoadingContext";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function UsuariosPage() {
    useCheckPermission(1008, true);
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [pageCount, setPageCount] = useState(0)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const {setIsLoading} = useLoading();
    // Adicionando um estado para forçar a atualização da tabela
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchUsuarios = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await getListaUsuarios(filtro);
        setUsuarios(retorno)
        setPageCount(Math.ceil(retorno.length / pagination.pageSize))
        setIsLoading(false);
    }

    useEffect(() => {
        fetchUsuarios(null);
    }, [pagination, refreshTrigger])

    const handleEdit = async (editedUsuario: Usuario) => {
        let usuarioPut: Partial<UsuarioDTO> = {
            id: editedUsuario.id,
            nome: editedUsuario.nome,
            email: editedUsuario.email,
            senha: editedUsuario.senha,
            clientesId: editedUsuario.clientes
                ?.filter(cliente => cliente != null)
                .filter(cliente => cliente.id != null)
                .map(cliente => cliente.id),
            isSuporte: editedUsuario.isSuporte,
            todasAsLojas: editedUsuario.todasAsLojas,
            perfis: editedUsuario.perfis.map(perfis => perfis.id),
        }
        await atualizaUsuario(usuarioPut);
        // Fecha o modal e dispara a atualização da tabela
        setRefreshTrigger(prev => prev + 1);
    }

    const handleAddUsuario = async (newUsuario: Usuario) => {
        let usuarioPost: Partial<UsuarioDTO> = {
            nome: newUsuario.nome,
            email: newUsuario.email,
            senha: newUsuario.senha,
            clientesId: newUsuario.clientes
                ?.filter(cliente => cliente != null)
                .filter(cliente => cliente.id != null)
                .map(cliente => cliente.id),
            isSuporte: newUsuario.isSuporte,
            todasAsLojas: newUsuario.todasAsLojas,
            perfis: newUsuario.perfis.map(perfis => perfis.id),
        }
        await cadastraUsuario(usuarioPost);
        // Fecha o modal e dispara a atualização da tabela
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    }

    const handleFiltroAction = async (filtro: any) => {
        await fetchUsuarios(filtro);
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao
                        tamanho='h2'
                        titulo='Cadastro de Usuários'
                    />
                    {useCheckPermission(1009, false) && (
                        <BotaoPadrao
                            variant='outline'
                            name='Adicionar Usuário'
                            onClick={() => setIsAddModalOpen(true)}
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                        />
                    )}

                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <UsuariosTable
                        data={usuarios}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onFiltroAction={handleFiltroAction}
                    />
                </div>
            </div>
            <UsuarioModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAddUsuario}
            />
        </div>
    )
}