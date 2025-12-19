"use client";

import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {atualiza, listaPorId} from '@/services/Bandeira';
import {useLoading} from '@/context/LoadingContext';
import BandeiraModal from "@/app/cadastros/bandeiras/BandeiraModal";
import {Bandeira} from "@/types/bandeira";
import {useToast} from "@/hooks/use-toast";

export default function BandeiraDetalhes() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [bandeira, setBandeira] = useState<Bandeira | undefined>(undefined);
    const {setIsLoading} = useLoading();
    const {toast} = useToast();

    useEffect(() => {
        if (id) {
            const fetchBandeira = async () => {
                setIsLoading(true);
                const bandeiraData = await listaPorId(Number(id));
                setBandeira(bandeiraData);
                setIsLoading(false);
            };
            fetchBandeira();
        }
    }, [id]);

    const handleEdit = async (editedBandeira: Bandeira) => {
        const updated = await atualiza(editedBandeira);
        toast({
            title: 'Bandeiras',
            description: 'Atualização de bandeira realizada com sucesso.',
            className: 'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary bg-white',
        });
        router.push('/cadastros/bandeiras');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
            <BandeiraModal
                isOpen={bandeira !== undefined}
                onCloseAction={() => {
                    setBandeira(undefined);
                    router.push('/cadastros/bandeiras');
                }}
                onSaveAction={handleEdit}
                objetoSelecionado={bandeira}
            />
        </div>
    );
}