"use client";

import {useParams, useRouter} from 'next/navigation';
import React, {useEffect, useState} from 'react';
import {useLoading} from '@/context/LoadingContext';
import {useToast} from "@/hooks/use-toast";
import {Client as Cliente, type ClienteDTO} from "@/types/client";
import ClienteModal from "@/app/cadastros/clientes/ClienteModal";
import {atualiza, listaPorId} from "@/services/Cliente";

export default function BandeiraDetalhes() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [cliente, setCliente] = useState<Cliente | undefined>(undefined);
    const {setIsLoading} = useLoading();
    const {toast} = useToast();

    useEffect(() => {
        if (id) {
            const fetchCliente = async () => {
                setIsLoading(true);
                const clienteData = await listaPorId(Number(id));
                setCliente(clienteData);
                setIsLoading(false);
            };
            fetchCliente();
        }
    }, [id]);

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
                agencia: bandeira.agencia && bandeira.agencia,
                conta: bandeira.conta,
                clienteId: edited.id,
                bandeiraId: bandeira.bandeira?.id,
                bancoId: bandeira.banco?.id,
                adquirenteId: bandeira.adquirente?.id,
                diasPagamento: bandeira.diasPagamento,
                bandeirasConfig: bandeira.bandeirasConfig || [],
                deleta: bandeira.deleta,
            })),
        };
        await atualiza(put);
        toast({
            title: 'Clientes',
            description: 'Atualização de cliente realizada com sucesso.',
            className: 'p-4 relative flex items-center shadow-md rounded-lg transition-all duration-300 hover:-translate-z-1 hover:scale-105 z-10 border-[#F5E158] text-primary bg-white',
        })
        router.push('/cadastros/clientes');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
            <ClienteModal
                isOpen={cliente !== undefined}
                onCloseAction={() => {
                    setCliente(undefined);
                    router.push('/cadastros/clientes');
                }}
                onSaveAction={handleEdit}
                clienteSelecionado={cliente}
            />
        </div>
    );
}