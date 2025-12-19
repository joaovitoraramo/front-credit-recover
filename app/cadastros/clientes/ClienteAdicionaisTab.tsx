// src/app/cadastros/clientes/ClienteAdicionaisTab.tsx
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import InputPadrao from '@/components/Inputs/InputPadrao';
import TituloPadrao from '@/components/Titulos/TituloPadrao';
import {Client, ClientAdditionalDetail, ClientCardData} from '@/types/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Trash2,
    Save,
    X,
    Edit,
    RotateCcw,
    Copy,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";

// Interface para o objeto que representará cada CARD completo no frontend


// Interface para os campos do formulário
interface FormFields {
    generalLabel: string;
    siteValue: string;
    loginValue: string;
    passwordValue: string;
    phoneValue: string;
    otherLabel: string;
    otherValue: string;
    notes: string;
}

interface ClienteAdicionaisTabProps {
    client: Partial<Client>;
    // ALTERAÇÃO CRÍTICA AQUI: onClientChange agora recebe ClientCardData[] diretamente
    onClientChange: (updatedClient: Partial<Client> & { adicionais?: ClientCardData[] }) => void;
}

export default function ClienteAdicionaisTab({ client, onClientChange }: ClienteAdicionaisTabProps) {
    const [localClientCards, setLocalClientCards] = useState<ClientCardData[]>([]);

    const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(false);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);

    const [currentFormFields, setCurrentFormFields] = useState<FormFields>({
        generalLabel: '',
        siteValue: '',
        loginValue: '',
        passwordValue: '',
        phoneValue: '',
        otherLabel: '',
        otherValue: '',
        notes: '',
    });

    // --- FUNÇÃO DE CONVERSÃO: ClientAdditionalDetail[] para ClientCardData[] ---
    // Usada ao carregar os dados do backend para o frontend
    const transformAdditionalDetailsToClientCards = useCallback((details: ClientAdditionalDetail[]): ClientCardData[] => {
        const cardMap: { [generalLabel: string]: ClientCardData } = {};
        const otherDetails: ClientAdditionalDetail[] = [];

        // Primeiro, agrupe todos os detalhes que não são do tipo 'OUTROS'
        details.forEach(detail => {
            if (detail.type === 'OUTROS') {
                otherDetails.push(detail); // Guarda os 'OUTROS' para processar depois
                return;
            }

            // Usa o 'label' do ClientAdditionalDetail como a chave principal para agrupar.
            const cardKey = detail.label;

            let cardData = cardMap[cardKey];

            if (!cardData) {
                cardData = {
                    id: String(Date.now() + Math.random()),
                    generalLabel: detail.label,
                    deleted: detail.deleted,
                    active: detail.active,
                };
                cardMap[cardKey] = cardData;
            }

            if (detail.type === 'SITE') {
                cardData.siteValue = detail.value;
            } else if (detail.type === 'LOGIN') {
                cardData.loginValue = detail.value;
            } else if (detail.type === 'SENHA') {
                cardData.passwordValue = detail.value;
            } else if (detail.type === 'TELEFONE') {
                cardData.phoneValue = detail.value;
            }

            // As notas devem ser consistentes para um card
            if (detail.notes && !cardData.notes) {
                cardData.notes = detail.notes;
            }
        });

        // Agora, tente associar os detalhes 'OUTROS' aos cards já criados
        otherDetails.forEach(otherDetail => {
            let foundCard = false;
            for (const key in cardMap) {
                const card = cardMap[key];
                if (
                    (otherDetail.label === card.generalLabel ||
                        (otherDetail.notes && otherDetail.notes === card.notes)) &&
                    (!card.otherLabel && !card.otherValue) // Evita sobrescrever um campo 'OUTROS' existente no card
                ) {
                    card.otherLabel = otherDetail.label;
                    card.otherValue = otherDetail.value;
                    if (otherDetail.notes && !card.notes) { // Adiciona notas se o card ainda não tiver
                        card.notes = otherDetail.notes;
                    }
                    foundCard = true;
                    break;
                }
            }

            if (!foundCard) {
                // Se não encontrou um card existente para associar, cria um novo card para este 'OUTROS'
                const newCardId = String(Date.now() + Math.random());
                cardMap[newCardId] = {
                    id: newCardId,
                    generalLabel: otherDetail.label, // Usa o label do 'OUTROS' como generalLabel do novo card
                    otherLabel: otherDetail.label,
                    otherValue: otherDetail.value,
                    notes: otherDetail.notes,
                    deleted: otherDetail.deleted,
                    active: otherDetail.active,
                };
            }
        });

        return Object.values(cardMap);
    }, []);


    // --- FUNÇÃO DE CONVERSÃO: ClientCardData[] para ClientAdditionalDetail[] ---
    // ESTA FUNÇÃO AINDA É NECESSÁRIA, MAS PROVAVELMENTE NO COMPONENTE PAI
    // Se o backend espera ClientAdditionalDetail[], o componente pai precisará chamá-la.
    // Ela não será mais chamada DENTRO deste componente para o onClientChange.
    const transformClientCardsToAdditionalDetails = useCallback((cards: ClientCardData[]): ClientAdditionalDetail[] => {
        const additionalDetails: ClientAdditionalDetail[] = [];

        cards.forEach(card => {
            const baseNotes = card.notes || undefined;
            const baseActive = card.active;
            const baseDeleted = card.deleted;

            if (card.siteValue) {
                additionalDetails.push({
                    id: String(Date.now() + Math.random()),
                    type: 'SITE',
                    label: card.generalLabel,
                    value: card.siteValue,
                    notes: baseNotes,
                    active: baseActive,
                    deleted: baseDeleted,
                });
            }
            if (card.loginValue) {
                additionalDetails.push({
                    id: String(Date.now() + Math.random()),
                    type: 'LOGIN',
                    label: card.generalLabel,
                    value: card.loginValue,
                    notes: baseNotes,
                    active: baseActive,
                    deleted: baseDeleted,
                });
            }
            if (card.passwordValue) {
                additionalDetails.push({
                    id: String(Date.now() + Math.random()),
                    type: 'SENHA',
                    label: card.generalLabel,
                    value: card.passwordValue,
                    notes: baseNotes,
                    active: baseActive,
                    deleted: baseDeleted,
                });
            }
            if (card.phoneValue) {
                additionalDetails.push({
                    id: String(Date.now() + Math.random()),
                    type: 'TELEFONE',
                    label: card.generalLabel,
                    value: card.phoneValue,
                    notes: baseNotes,
                    active: baseActive,
                    deleted: baseDeleted,
                });
            }
            if (card.otherValue && card.otherLabel) {
                additionalDetails.push({
                    id: String(Date.now() + Math.random()),
                    type: 'OUTROS',
                    label: card.otherLabel,
                    value: card.otherValue,
                    notes: baseNotes,
                    active: baseActive,
                    deleted: baseDeleted,
                });
            }
        });

        return additionalDetails;
    }, []);


    // Carrega os dados iniciais do cliente e os transforma em ClientCardData
    useEffect(() => {
        if (client.adicionais && Array.isArray(client.adicionais)) {
            // Verifica se o primeiro elemento é um ClientAdditionalDetail (para saber se precisa transformar)
            // Se o componente pai já estiver passando ClientCardData[], esta condição será falsa.
            const isAdditionalDetailArray = client.adicionais.length > 0 &&
                (client.adicionais[0] as ClientAdditionalDetail).type !== undefined;

            if (isAdditionalDetailArray) {
                const transformedCards = transformAdditionalDetailsToClientCards(client.adicionais as ClientAdditionalDetail[]);
                setLocalClientCards(transformedCards);
            } else {
                // Assume que já é ClientCardData[]
                setLocalClientCards(client.adicionais as ClientCardData[]);
            }
        } else {
            setLocalClientCards([]);
        }
    }, [client.adicionais, transformAdditionalDetailsToClientCards]);


    const activeCards = useMemo(() => localClientCards.filter(card => !card.deleted && card.active), [localClientCards]);
    const deletedCards = useMemo(() => localClientCards.filter(card => card.deleted), [localClientCards]);

    const handleAddNewCard = () => {
        setIsAddingNewCard(true);
        setEditingCardId(null);
        setCurrentFormFields({
            generalLabel: '',
            siteValue: '',
            loginValue: '',
            passwordValue: '',
            phoneValue: '',
            otherLabel: '',
            otherValue: '',
            notes: '',
        });
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentFormFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveCard = () => {
        const { generalLabel, siteValue, loginValue, passwordValue, phoneValue, otherLabel, otherValue, notes } = currentFormFields;

        if (!generalLabel.trim()) {
            toast.error('Por favor, preencha o "Nome (Rótulo do Card)" para o card.');
            return;
        }

        if (otherValue.trim() && !otherLabel.trim()) {
            toast.error('Por favor, preencha o "Rótulo" para o "Campo Adicional" se o valor estiver preenchido.');
            return;
        }

        const hasAnyValue = [
            siteValue, loginValue, passwordValue, phoneValue, otherValue
        ].some(val => val.trim() !== '');

        if (!hasAnyValue && !notes.trim()) {
            toast.info('Nenhum detalhe ou observação para salvar. Por favor, preencha algo.');
            return;
        }

        const newCardId = editingCardId || null;

        const cardToSave: ClientCardData = {
            id: newCardId,
            generalLabel: generalLabel.trim(),
            siteValue: siteValue.trim() || undefined,
            loginValue: loginValue.trim() || undefined,
            passwordValue: passwordValue.trim() || undefined,
            phoneValue: phoneValue.trim() || undefined,
            otherLabel: otherLabel.trim() || undefined,
            otherValue: otherValue.trim() || undefined,
            notes: notes.trim() || undefined,
            deleted: false,
            active: true,
        };

        let updatedCards: ClientCardData[];

        if (editingCardId) {
            updatedCards = localClientCards.map(card =>
                card.id === editingCardId ? cardToSave : card
            );
            toast.success('Card atualizado com sucesso!');
        } else {
            updatedCards = [...localClientCards, cardToSave];
            toast.success('Novo card adicionado com sucesso!');
        }

        setLocalClientCards(updatedCards);
        // PONTO CRÍTICO: Agora, onClientChange recebe diretamente ClientCardData[]
        // A função transformClientCardsToAdditionalDetails NÃO é mais chamada AQUI.
        onClientChange({ ...client, adicionais: updatedCards });

        setIsAddingNewCard(false);
        setEditingCardId(null);
        setCurrentFormFields({
            generalLabel: '',
            siteValue: '',
            loginValue: '',
            passwordValue: '',
            phoneValue: '',
            otherLabel: '',
            otherValue: '',
            notes: '',
        });
    };

    const handleCancelForm = () => {
        setIsAddingNewCard(false);
        setEditingCardId(null);
        setCurrentFormFields({
            generalLabel: '',
            siteValue: '',
            loginValue: '',
            passwordValue: '',
            phoneValue: '',
            otherLabel: '',
            otherValue: '',
            notes: '',
        });
    };

    const handleEditCard = useCallback((cardToEdit: ClientCardData) => {
        setIsAddingNewCard(true);
        setEditingCardId(cardToEdit.id);
        setCurrentFormFields({
            generalLabel: cardToEdit.generalLabel,
            siteValue: cardToEdit.siteValue || '',
            loginValue: cardToEdit.loginValue || '',
            passwordValue: cardToEdit.passwordValue || '',
            phoneValue: cardToEdit.phoneValue || '',
            otherLabel: cardToEdit.otherLabel || '',
            otherValue: cardToEdit.otherValue || '',
            notes: cardToEdit.notes || '',
        });
    }, []);

    const handleDeleteCard = useCallback((cardIdToDelete: string | null) => {
        const updatedCards = localClientCards.map((card) => {
            if (card.id === cardIdToDelete) {
                return { ...card, active: false, deleted: true };
            }
            return card;
        });
        setLocalClientCards(updatedCards);
        // PONTO CRÍTICO: Agora, onClientChange recebe diretamente ClientCardData[]
        onClientChange({ ...client, adicionais: updatedCards });
        toast.success('Card movido para "Excluídos"!');
    }, [localClientCards, client, onClientChange]); // Removido transformClientCardsToAdditionalDetails da dependência

    const handleUndoDeleteCard = useCallback((cardIdToUndo: string | null) => {
        const updatedCards = localClientCards.map((card) => {
            if (card.id === cardIdToUndo) {
                return { ...card, active: true, deleted: false };
            }
            return card;
        });
        setLocalClientCards(updatedCards);
        // PONTO CRÍTICO: Agora, onClientChange recebe diretamente ClientCardData[]
        onClientChange({ ...client, adicionais: updatedCards });
        toast.success('Card restaurado!');
    }, [localClientCards, client, onClientChange]); // Removido transformClientCardsToAdditionalDetails da dependência

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copiado para a área de transferência!');
        }).catch(() => {
            toast.error('Erro ao copiar.');
        });
    }, []);

    return (
        <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <TituloPadrao titulo="Informações Adicionais do Cliente" tamanho="h3" className="text-gray-800 text-center mb-8" />

            <div className="flex justify-center mb-8">
                <BotaoPadrao
                    name={'Adicionar Novo Card'}
                    onClick={handleAddNewCard}
                    variant={'outline'}
                    icon={<Plus className="h-5 w-5" />}
                />
            </div>

            {/* Formulário de Adição/Edição de Card */}
            {(isAddingNewCard || editingCardId) && (
                <Card className="border-blue-400 bg-blue-50 shadow-xl rounded-xl transition-all duration-500 ease-in-out transform scale-100 opacity-100 animate-fadeIn">
                    <CardHeader className="border-b border-blue-200 pb-4">
                        <CardTitle className="text-blue-800 text-2xl font-bold">
                            {editingCardId ? 'Editar Card de Detalhes' : 'Adicionar Novo Card de Detalhes'}
                        </CardTitle>
                        <CardDescription className="text-blue-700 text-base">
                            Preencha os campos relevantes para este card. Apenas os campos com valores serão exibidos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div>
                            <InputPadrao
                                id="generalLabel"
                                name="generalLabel"
                                value={currentFormFields.generalLabel}
                                onChange={handleFieldChange}
                                label="Nome (Rótulo do Card)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Este rótulo identifica o card.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputPadrao
                                    id="siteValue"
                                    name="siteValue"
                                    value={currentFormFields.siteValue}
                                    onChange={handleFieldChange}
                                    label="Site (URL)"
                                />
                            </div>
                            <div>
                                <InputPadrao
                                    id="loginValue"
                                    name="loginValue"
                                    value={currentFormFields.loginValue}
                                    onChange={handleFieldChange}
                                    label="Login"
                                />
                            </div>
                            <div>
                                <InputPadrao
                                    id="passwordValue"
                                    name="passwordValue"
                                    value={currentFormFields.passwordValue}
                                    onChange={handleFieldChange}
                                    label="Senha"
                                    type="password"
                                />
                            </div>
                            <div>
                                <InputPadrao
                                    id="phoneValue"
                                    name="phoneValue"
                                    value={currentFormFields.phoneValue}
                                    onChange={handleFieldChange}
                                    label="Telefone"
                                />
                            </div>
                        </div>
                        {/* Campo Adicional (Outros) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputPadrao
                                    id="otherLabel"
                                    name="otherLabel"
                                    value={currentFormFields.otherLabel}
                                    onChange={handleFieldChange}
                                    label="Rótulo do Campo Adicional"
                                />
                                <p className="text-xs text-gray-500 mt-1">Se preencher o "Valor Adicional", este campo é obrigatório.</p>
                            </div>
                            <div>
                                <InputPadrao
                                    id="otherValue"
                                    name="otherValue"
                                    value={currentFormFields.otherValue}
                                    onChange={handleFieldChange}
                                    label="Valor Adicional"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes" className="text-gray-700 font-medium mb-1">Observações do Card</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={currentFormFields.notes}
                                onChange={handleFieldChange}
                                placeholder="Observações específicas para este card."
                                rows={4}
                                className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out shadow-sm focus:shadow-md"
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <BotaoPadrao
                                name={'Cancelar'}
                                variant={'outline'}
                                onClick={handleCancelForm}
                                icon={<X className="h-4 w-4" />}
                            />
                            <BotaoPadrao
                                name={editingCardId ? 'Atualizar Card' : 'Salvar Card'}
                                variant={'outline'}
                                onClick={handleSaveCard}
                                icon={<Save className="h-4 w-4" />}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Cards Ativos */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Cards de Detalhes Ativos</h3>
                {activeCards.length > 0 ? (
                    activeCards.map((card) => (
                        <Card
                            key={card.id}
                            className="flex flex-col p-4 bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border border-gray-200 transform hover:-translate-y-1"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
                                <CardTitle className="text-lg font-bold text-blue-800 flex-grow">
                                    {card.generalLabel}
                                </CardTitle>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <Button
                                        onClick={() => handleEditCard(card)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full p-2 transition-colors duration-200 transform hover:scale-110 active:scale-90"
                                        title="Editar Card"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteCard(card.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-2 transition-colors duration-200 transform hover:scale-110 active:scale-90"
                                        title="Excluir Card"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 p-0">
                                {card.siteValue && (
                                    <div className="flex items-center justify-between text-sm text-gray-700">
                                        <div className="flex-1">
                                            <span className="font-semibold">Site (URL): </span>
                                            {card.siteValue}
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(card.siteValue || '')}
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                {card.loginValue && (
                                    <div className="flex items-center justify-between text-sm text-gray-700">
                                        <div className="flex-1">
                                            <span className="font-semibold">Login: </span>
                                            {card.loginValue}
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(card.loginValue || '')}
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                {card.passwordValue && (
                                    <div className="flex items-center justify-between text-sm text-gray-700">
                                        <div className="flex-1">
                                            <span className="font-semibold">Senha: </span>
                                            ********
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(card.passwordValue || '')}
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                {card.phoneValue && (
                                    <div className="flex items-center justify-between text-sm text-gray-700">
                                        <div className="flex-1">
                                            <span className="font-semibold">Telefone: </span>
                                            {card.phoneValue}
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(card.phoneValue || '')}
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                {card.otherValue && (
                                    <div className="flex items-center justify-between text-sm text-gray-700">
                                        <div className="flex-1">
                                            <span className="font-semibold">{card.otherLabel || 'Campo Adicional'}: </span>
                                            {card.otherValue}
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(card.otherValue || '')}
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                {card.notes && (
                                    <CardDescription className="text-xs text-gray-500 italic mt-2">
                                        Observações: {card.notes}
                                    </CardDescription>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-md text-gray-600 p-4 bg-white rounded-md shadow-sm border border-gray-200 text-center">Nenhum card de detalhes ativo cadastrado.</p>
                )}
            </div>

            {/* Lista de Cards Excluídos */}
            {deletedCards.length > 0 && (
                <div className="mt-8 space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Cards de Detalhes Excluídos</h3>
                    {deletedCards.map((card) => (
                        <Card
                            key={card.id}
                            className="flex flex-col p-4 bg-gray-50 shadow-sm opacity-80 rounded-lg border border-gray-300 transition-all duration-300 transform hover:scale-105"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
                                <CardTitle className="text-lg font-bold text-gray-600 line-through flex-grow">
                                    {card.generalLabel}
                                </CardTitle>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <Button
                                        onClick={() => handleUndoDeleteCard(card.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full p-2 transition-colors duration-200 transform hover:scale-110 active:scale-90"
                                        title="Desfazer Exclusão"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 p-0">
                                {card.siteValue && (
                                    <div className="flex items-center text-sm text-gray-600 line-through">
                                        <span className="font-semibold">Site (URL): </span>
                                        {card.siteValue}
                                    </div>
                                )}
                                {card.loginValue && (
                                    <div className="flex items-center text-sm text-gray-600 line-through">
                                        <span className="font-semibold">Login: </span>
                                        {card.loginValue}
                                    </div>
                                )}
                                {card.passwordValue && (
                                    <div className="flex items-center text-sm text-gray-600 line-through">
                                        <span className="font-semibold">Senha: </span>
                                        ********
                                    </div>
                                )}
                                {card.phoneValue && (
                                    <div className="flex items-center text-sm text-gray-600 line-through">
                                        <span className="font-semibold">Telefone: </span>
                                        {card.phoneValue}
                                    </div>
                                )}
                                {card.otherValue && (
                                    <div className="flex items-center text-sm text-gray-600 line-through">
                                        <span className="font-semibold">{card.otherLabel || 'Campo Adicional'}: </span>
                                        {card.otherValue}
                                    </div>
                                )}
                                {card.notes && (
                                    <CardDescription className="text-xs text-gray-400 italic mt-2 line-through">
                                        Observações: {card.notes}
                                    </CardDescription>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}