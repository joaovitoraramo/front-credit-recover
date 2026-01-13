"use client";

import {useParams, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {atualiza, listaPorId} from '@/services/Bandeira';
import {useLoading} from '@/context/LoadingContext';
import BandeiraModal from "@/app/cadastros/bandeiras/BandeiraModal";
import {Bandeira} from "@/types/bandeira";
import {useToast} from "@/components/toast/ToastProvider";

export default function BandeiraDetalhes() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [bandeira, setBandeira] = useState<Bandeira | undefined>(undefined);
    const {setIsLoading} = useLoading();
    const { showToast } = useToast();

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
        showToast("Atualização de bandeira realizada com sucesso.", "success");
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