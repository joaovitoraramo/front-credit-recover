// app/cadastros/bandeiras/page.tsx

"use client";

import {useState, useEffect} from "react";
import BandeirasTable from "@/app/cadastros/bandeiras/BandeirasTable";
import {Plus} from "lucide-react";
import type {Bandeira} from "@/types/bandeira";
import type {PaginationState} from "@tanstack/react-table";
import BandeiraModal from "@/app/cadastros/bandeiras/BandeiraModal";
import {lista, cadastra, atualiza, deleta} from "@/services/Bandeira";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {useLoading} from "@/context/LoadingContext";
import {useToast} from "@/hooks/use-toast";
import {useCheckPermission} from "@/hooks/useCheckPermission";

export default function BandeirasPage() {
    useCheckPermission(1016, true);
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const {setIsLoading} = useLoading();
    const {toast} = useToast();

    const fetchBandeiras = async (filtro: any | null) => {
        setIsLoading(true);
        const retorno = await lista(filtro);
        setBandeiras(retorno);
        setPageCount(Math.ceil(retorno.length / pagination.pageSize));
        setIsLoading(false);
        return retorno;
    };

    useEffect(() => {
        fetchBandeiras(null);
    }, [pagination]);

    const handleEdit = async (editedBandeira: Bandeira) => {
        const updated = await atualiza(editedBandeira);
        setBandeiras(bandeiras.map((bandeira) => (bandeira.id === updated.id ? updated : bandeira)));
        toast({
            title: 'Bandeiras',
            description: 'Atualização de bandeira realizada com sucesso.',
            className: 'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary bg-white',
        })
    };

    const handleDelete = async (deletedBandeira: Bandeira) => {
        await deleta(deletedBandeira);
        setBandeiras(bandeiras.filter((bandeira) => bandeira.id !== deletedBandeira.id));
    };

    const handleAddBandeira = async (newBandeira: Bandeira) => {
        const post: Partial<Bandeira> = {
            nome: newBandeira.nome,
            tipo: newBandeira.tipo,
            bins: newBandeira.bins,
            logo: newBandeira.logo,
        }
        const added = await cadastra(post);
        setBandeiras([...bandeiras, added]);
        setIsAddModalOpen(false);
        toast({
            title: 'Bandeiras',
            description: 'Cadastro de bandeira realizado com sucesso.',
            className: 'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#36913A] text-[#58F560] bg-white',
        })
    };

    const handleFiltroAction = async (filtro: any) => {
        await fetchBandeiras(filtro);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-8 ml-16 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho="h2" titulo="Cadastro de Bandeiras"/>
                    {useCheckPermission(1017, false) && (
                        <BotaoPadrao
                            onClick={() => setIsAddModalOpen(true)}
                            name="Adicionar Bandeira"
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                            variant="outline"
                        />
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <BandeirasTable
                        data={bandeiras}
                        pageCount={pageCount}
                        onPaginationChange={setPagination}
                        onEditAction={handleEdit}
                        onFiltroAction={handleFiltroAction}
                        onDeleteAction={handleDelete}
                    />
                </div>
            </div>
            <BandeiraModal
                isOpen={isAddModalOpen}
                onCloseAction={() => setIsAddModalOpen(false)}
                onSaveAction={handleAddBandeira}
            />
        </div>
    );
}
