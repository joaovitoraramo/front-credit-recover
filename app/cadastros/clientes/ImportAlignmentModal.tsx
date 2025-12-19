// src/app/cadastros/clientes/ImportAlignmentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TituloPadrao from '@/components/Titulos/TituloPadrao';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import MensagemPadrao, { IMensagemPadraoProps } from '@/components/Util/MensagemPadrao';
import InputItensCombobox from '@/components/Inputs/InputItensCombo';
import { Ban, Import, Check } from 'lucide-react';
import type {Client as Cliente, Client} from '@/types/client'; // Assumindo que você tem um tipo Client
import { lista as listaClientes } from '@/services/Cliente';
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";
import {searchClientes} from "@/lib/apiProcessamento"; // Assumindo que você tem um serviço para listar clientes

interface ImportAlignmentModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onImportAction: (sourceClient: Client) => void;
    currentClientName: string; // Para exibir o nome do cliente que receberá as configurações
}

export default function ImportAlignmentModal({
                                                 isOpen,
                                                 onCloseAction,
                                                 onImportAction,
                                                 currentClientName,
                                             }: ImportAlignmentModalProps) {
    if (!isOpen) return null;

    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [message, setMessage] = useState<IMensagemPadraoProps | null>(null);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [clientSearch, setClientSearch] = useState("")

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setIsLoadingClients(true);
                // Assumindo que listaClientes retorna uma Promise<Client[]>
                const response = await listaClientes(null);
                // Filtra o cliente atual para não ser selecionado para importação dele mesmo
                const filteredClients = response.filter(
                    (client: Client) => client.nomeFantasia !== currentClientName
                );
                setClients(filteredClients);
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                setMessage({
                    tipo: 'erro',
                    mensagem: 'Erro ao carregar a lista de clientes para importação.',
                });
            } finally {
                setIsLoadingClients(false);
            }
        };

        if (isOpen) {
            fetchClients();
            setSelectedClient(null); // Reseta a seleção ao abrir
            setMessage(null); // Limpa mensagens
        }
    }, [isOpen, currentClientName]);

    const handleClientSelect = (client: Client | null) => {
        setSelectedClient(client);
        setMessage(null);
    };

    const handleImport = () => {
        if (!selectedClient) {
            setMessage({
                tipo: 'aviso',
                mensagem: 'Por favor, selecione um cliente para importar as configurações.',
            });
            return;
        }

        setMessage(null);
        onImportAction(selectedClient);
        onCloseAction(); // Fecha o modal após a ação
    };

    const handleSelectClient = (client: Client | null) => {
        setSelectedClient(client);
        setMessage(null); // Limpa mensagem ao fazer nova seleção
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                <TituloPadrao
                    titulo={`Importar Alinhamento para ${currentClientName}`}
                    //descricao="Selecione um cliente para importar as configurações de alinhamento (bandeiras)."
                    tamanho={'h3'}
                />

                {message && (
                    <div className="mt-4">
                        <MensagemPadrao tipo={message.tipo} mensagem={message.mensagem} />
                    </div>
                )}

                <div className="mt-6">
                    <InputItensCombobox
                        titulo={'Cliente'}
                        data={clients}
                        selectedItem={selectedClient}
                        campoMostrar={'nomeFantasia'}
                        search={clientSearch}
                        setSearch={setClientSearch}
                        setSelected={handleClientSelect}
                        width={400}
                        hideLabel
                    />
                </div>

                <div className="mt-6 flex justify-end gap-x-4">
                    <BotaoPadrao
                        variant="outline"
                        onClick={onCloseAction}
                        name="Cancelar"
                        icon={<Ban className="h-4 w-4 font-bold" />}
                    />
                    <BotaoPadrao
                        variant="outline" // Pode ser 'default' ou 'success' se houver
                        onClick={handleImport}
                        name="Importar"
                        icon={<Import className="h-5 w-5 mr-2" />} // Ícone sugerido
                        disabled={!selectedClient} // Desabilita se nenhum cliente estiver selecionado
                    />
                </div>
            </div>
        </div>
    );
}