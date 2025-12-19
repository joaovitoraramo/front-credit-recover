'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { Processamento } from '@/types/processamento';
import Link from 'next/link';
import { ExternalLink, Save } from 'lucide-react';
import { Bandeira } from '@/types/bandeira';
import InputItensCombobox from '@/components/Inputs/InputItensCombo';
import { listaPorClienteTipo } from '@/services/Bandeira';
import { Badge } from '@/components/ui/badge';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import { useModalAvisoConfirmacao } from '@/context/ModalAvisoConfirmacaoContext';
import InputPadrao from '@/components/Inputs/InputPadrao';
import { lista } from '@/services/Bin';
import MensagemPadrao from '@/components/Util/MensagemPadrao';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ViewProcessamentoModalProps {
    processamento: Processamento | null;
    isOpen: boolean;
    onClose: () => void;
    onEditAction: (processamento: Processamento) => void;
}

export function ViewProcessamentoModal({
                                           processamento,
                                           isOpen,
                                           onClose,
                                           onEditAction,
                                       }: ViewProcessamentoModalProps) {
    if (!processamento) return null;
    const [activeTab, setActiveTab] = useState('venda');
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
    const [bandeiraSearch, setBandeiraSearch] = useState('');
    const [selectedBandeira, setSelectedBandeira] = useState<Bandeira | null>(
        null,
    );
    const { setIsOpen, setTitulo, setDescricao, confirmacao, setConfirmacao } =
        useModalAvisoConfirmacao();
    const [binDigitado, setBinDigitado] = useState(
        processamento.bin !== null ? processamento.bin : '',
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const [tituloModal, setTituloModal] = useState<string>('');
    const [descricaoModal, setDescricaoModal] = useState<string>('');
    const [confirmacaoModal, setConfirmacaoModal] = useState<string>('');
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const fetchBandeiras = useCallback(async (filtro: any | null) => {
        const retorno = await listaPorClienteTipo(
            filtro,
            processamento.cliente.id,
            processamento.tipoProduto,
        );
        setBandeiras(retorno);
        return retorno;
    }, []);

    useEffect(() => {
        setSelectedBandeira(processamento.bandeira);
    }, [processamento.bandeira]);

    useEffect(() => {
        fetchBandeiras(bandeiraSearch);
    }, [bandeiraSearch]);

    // =================================================================
    // INÍCIO DA ALTERAÇÃO: useEffect para validação em tempo real
    // =================================================================
    /**
     * @description
     * Este useEffect realiza a validação do BIN sempre que a bandeira selecionada é alterada.
     * Se o processamento já tiver um BIN e o usuário selecionar uma nova bandeira,
     * o sistema verifica se o BIN já está associado a outra bandeira do mesmo tipo.
     * Isso fornece um feedback instantâneo ao usuário, melhorando a usabilidade.
     */
    useEffect(() => {
        const validarConflitoBandeira = async () => {
            // Limpa a mensagem de erro anterior antes de uma nova validação
            setErrorMessage(null);

            // A validação ocorre se:
            // 1. O processamento original já tem um BIN.
            // 2. Uma bandeira foi selecionada no combobox.
            // 3. A bandeira selecionada é diferente da bandeira original do processamento.
            if (
                processamento.bin &&
                selectedBandeira &&
                processamento.bandeira?.id !== selectedBandeira.id
            ) {
                const filtro = { bin: processamento.bin };
                const consultaBin = await lista(filtro);

                if (consultaBin.length > 0) {
                    for (const e of consultaBin) {
                        // Verifica se o BIN encontrado pertence a uma bandeira diferente, mas do mesmo tipo (crédito/débito)
                        if (
                            e.bandeira.id !== selectedBandeira.id &&
                            e.bandeira.tipo === selectedBandeira.tipo
                        ) {
                            // Define a mensagem de erro que será exibida ao usuário
                            setErrorMessage(
                                `O bin ${processamento.bin} pertence à bandeira: ${e.bandeira.nome}. Verifique o cadastro de bandeiras.`,
                            );
                            break; // Interrompe o loop pois o erro já foi encontrado
                        }
                    }
                }
            }
        };

        validarConflitoBandeira();
    }, [selectedBandeira, processamento.bin, processamento.bandeira]);
    // =================================================================
    // FIM DA ALTERAÇÃO
    // =================================================================

    const onSave = async () => {
        // =================================================================
        // INÍCIO DA ALTERAÇÃO: Bloqueio de salvamento com erro
        // =================================================================
        /**
         * @description
         * Adicionada uma verificação para impedir que o processo de salvamento continue
         * se já existir uma mensagem de erro sendo exibida na tela.
         */
        if (errorMessage) {
            return;
        }
        // =================================================================
        // FIM DA ALTERAÇÃO
        // =================================================================

        let errorMessageOnSave = null;
        let descricao = '';

        if (binDigitado !== '') {
            const filtro = { bin: binDigitado };
            const consultaBin = await lista(filtro);

            if (consultaBin.length > 0) {
                for (const e of consultaBin) {
                    if (
                        selectedBandeira &&
                        e.bandeira.id !== selectedBandeira.id &&
                        e.bandeira.tipo === selectedBandeira.tipo
                    ) {
                        errorMessageOnSave = `O bin digitado pertence à bandeira: ${e.bandeira.nome}. Verifique o cadastro de bandeiras.`;
                        break;
                    }
                }
            } else {
                descricao =
                    'Este bin não possui bandeira vinculada. Ao salvar, ele será automaticamente atribuído à bandeira selecionada, afetando outros registros com o mesmo bin.';
            }

            if (errorMessageOnSave) {
                setErrorMessage(errorMessageOnSave);
                return;
            }
        }

        setTitulo('Bandeiras');
        setDescricao(
            descricao ||
            (processamento.bandeira
                ? 'Deseja alterar a bandeira deste processamento?\nAlterações aqui não afetam outros processamentos com o mesmo bin. Para alterações em massa, ajuste o cadastro de bandeiras.'
                : 'Deseja alterar a bandeira deste processamento?\nAo fazer isto, o bin será atribuído a esta bandeira, afetando outros processamentos com o mesmo bin.'),
        );
        setIsOpen(true);
    };

    useEffect(() => {
        if (confirmacao) {
            if (selectedBandeira) {
                let objProcessamento: Processamento;
                objProcessamento = {
                    ...processamento,
                    bandeira: selectedBandeira,
                    bin: binDigitado,
                };
                onEditAction(objProcessamento);
                setConfirmacao(false);
                onClose();
            }
        }
    }, [confirmacao]);

    const renderInfo = (
        label: string,
        value: string | number,
        badge: boolean,
        variant?:
            | 'default'
            | 'secondary'
            | 'destructive'
            | 'outline'
            | null
            | undefined,
    ) => (
        <div className="mb-2 flex items-center">
            <span className="font-semibold text-gray-600">{label}:</span>
            {badge ? (
                <Badge className="ml-2" variant={variant}>
                    {value}
                </Badge>
            ) : (
                <span className="ml-2">{value}</span>
            )}
        </div>
    );

    const renderInfoItem = (
        label: string,
        value: string | number,
        taxaInfo?: { color: string; label: string },
        badgeInfo?: { color: string; label: string },
    ) => (
        <div className="mb-2 flex items-center">
            <span className="font-semibold text-gray-600">{label}:</span>
            <span
                className={`ml-2 ${
                    taxaInfo ? `text-${taxaInfo.color}-600` : ''
                }`}
            >
                {value}
            </span>
            {taxaInfo && (
                <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-[${taxaInfo.color}]-100 text-${taxaInfo.color}-800`}
                >
                    {taxaInfo.label}
                </span>
            )}
            {badgeInfo && <Badge variant="default">{badgeInfo.label}</Badge>}
        </div>
    );

    const renderVendaInfo = (processamento: Processamento) => (
        <>
            {renderInfoItem('ID', processamento.id)}
            {renderInfoItem('Qtde Parcelas', processamento.qtdeParcelas)}
            {renderInfoItem('Parcela (selecionada)', processamento.parcela)}
            {renderInfoItem(
                'Valor Total',
                processamento.valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
            )}
            {renderInfo(
                'Taxa',
                `${processamento.taxa.toFixed(2)}%`,
                true,
                'default',
            )}
            {renderInfoItem(
                'Total Taxa',
                processamento.totalTaxa.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
            )}
            {renderInfoItem(
                'Valor Líquido',
                processamento.valorLiquido.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
            )}
            {renderInfoItem('Data Transação', processamento.dataTransacao)}
            {renderInfoItem('Hora Transação', processamento.horaTransacao)}
            {renderInfoItem('Data Pagamento', processamento.dataPagamento)}
            {renderInfoItem('BIN', processamento.bin)}
            {renderInfoItem('Identificação', processamento.nsuHost)}
            {renderInfo(
                'Lançamento Manual',
                processamento.lancManual ? 'Sim' : 'Não',
                true,
                processamento.lancManual ? 'destructive' : 'default',
            )}
        </>
    );

    const renderClienteInfo = (cliente: Processamento['cliente']) => (
        <>
            {renderInfoItem('Nome Fantasia', cliente.nomeFantasia)}
            {renderInfoItem('Razão Social', cliente.razaoSocial)}
            {renderInfoItem('CNPJ', cliente.cnpj)}
            {renderInfoItem('Endereço', cliente.endereco)}
            {renderInfoItem('CEP', cliente.cep)}
            {renderInfoItem('Telefone', cliente.telefone)}
            {renderInfoItem('Celular', cliente.celular)}
            {renderInfoItem('Email', cliente.email)}
            {renderInfoItem('PDVs', cliente.pdvs)}
            {renderInfoItem('Secundário', cliente.emailSecundario)}
            {renderInfoItem('POS', cliente.pos)}
            {renderInfoItem('Regime Tributário', cliente.regimeTributario)}
            {renderInfoItem('ERP', cliente.erp)}
            {renderInfoItem('TEF', cliente.tef)}
        </>
    );

    const renderBandeiraInfo = (
        bandeira: Bandeira,
        processamento: Processamento,
    ) => {
        return (
            <div className="w-full">
                {errorMessage && (
                    <MensagemPadrao tipo="erro" mensagem={errorMessage} />
                )}
                {renderInfoItem('Nome do Produto', processamento.nomeProduto)}
                <div>
                    <span className="font-semibold text-gray-600">
                        Tipo da venda:
                    </span>
                    <Badge className="m-2 bg-primary">
                        {processamento.tipoProduto === 'D'
                            ? 'Débito'
                            : 'Crédito'}
                    </Badge>
                </div>
                <div className="w-1/4 mb-2 mt-4">
                    <InputPadrao
                        type="text"
                        id="bin"
                        name="bin"
                        label="Bin"
                        value={binDigitado}
                        onChange={(e) => setBinDigitado(e.target.value)}
                        disabled={
                            processamento.bin !== null &&
                            processamento.bin !== ''
                        }
                    />
                </div>
                <InputItensCombobox
                    titulo={'Bandeira'}
                    data={bandeiras}
                    search={bandeiraSearch}
                    setSearch={setBandeiraSearch}
                    setSelected={setSelectedBandeira}
                    selectedItem={selectedBandeira}
                    campoMostrar={'nome'}
                    width={584}
                />
                {selectedBandeira &&
                    selectedBandeira.nome &&
                    selectedBandeira.tipo && (
                        <div className="m-2">
                            <div>
                                <span className="font-semibold text-gray-600">
                                    Tipo da bandeira:
                                </span>
                                <Badge
                                    className={`m-2 ${
                                        selectedBandeira.tipo ===
                                        processamento.tipoProduto
                                            ? 'bg-primary'
                                            : 'bg-red-800'
                                    }`}
                                >
                                    {selectedBandeira.tipo === 'D'
                                        ? 'Débito'
                                        : 'Crédito'}
                                </Badge>
                            </div>
                        </div>
                    )}
            </div>
        );
    };

    const renderLoteInfo = (processamento: Processamento) => (
        <>
            {processamento.lote && (
                <div>
                    <span className="font-semibold text-gray-600">Lote:</span>
                    <Badge className={`m-2 bg-primary`}>
                        {processamento.lote.id}
                    </Badge>
                </div>
            )}
            {renderInfoItem(
                'Previsão de Pagamento',
                processamento.dataPagamento,
            )}
        </>
    );

    const handleBandeiraNavigation = () => {
        setTituloModal('Bandeira');
        setDescricaoModal(
            'Deseja realmente navegar para o cadastro da bandeira? Essa ação leva para a pagina de cadastros, saindo da pagina de processamentos.',
        );
        setIsOpenModal(true);
    };

    const handleClienteNavigation = () => {
        setTituloModal('Cliente');
        setDescricaoModal(
            'Deseja realmente navegar para o cadastro do cliente? Essa ação leva para a pagina de cadastros, saindo da pagina de processamentos.',
        );
        setIsOpenModal(true);
    };

    useEffect(() => {
        if (confirmacaoModal.toLowerCase() === 'cliente') {
            router.push(`/cadastros/clientes`);
            setTimeout(() => {
                router.push(`/cadastros/clientes/${processamento?.cliente.id}`);
            }, 500);
            setConfirmacaoModal('');
        }
        if (confirmacaoModal.toLowerCase() === 'bandeira') {
            router.push(`/cadastros/bandeiras`);
            setTimeout(() => {
                router.push(
                    `/cadastros/bandeiras/${processamento?.bandeira.id}`,
                );
            }, 500);
            setConfirmacaoModal('');
        }
    }, [confirmacaoModal]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">
                        Detalhes do Processamento
                    </DialogTitle>
                </DialogHeader>
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-4 mb-4 rounded-2xl overflow-hidden">
                        <TabsTrigger
                            value="venda"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl"
                        >
                            Venda
                        </TabsTrigger>
                        <TabsTrigger
                            value="cliente"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl flex items-center justify-center"
                        >
                            Cliente
                            {processamento.cliente &&
                            activeTab !== 'cliente' ? (
                                <button
                                    onClick={handleClienteNavigation}
                                    className="ml-2"
                                >
                                    <ExternalLink className="w-4 h-4 text-primary hover:text-gray-700" />
                                </button>
                            ) : activeTab === 'cliente' &&
                            processamento.cliente ? (
                                <button
                                    onClick={handleClienteNavigation}
                                    className="ml-2"
                                >
                                    <ExternalLink className="w-4 h-4 text-white hover:text-gray-200" />
                                </button>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="bandeira"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl flex items-center justify-center"
                        >
                            Bandeira
                            {processamento.bandeira &&
                            activeTab !== 'bandeira' ? (
                                <button
                                    onClick={handleBandeiraNavigation}
                                    className="ml-2"
                                >
                                    <ExternalLink className="w-4 h-4 text-primary hover:text-gray-700" />
                                </button>
                            ) : activeTab === 'bandeira' &&
                            processamento.bandeira ? (
                                <button
                                    onClick={handleBandeiraNavigation}
                                    className="ml-2"
                                >
                                    <ExternalLink className="w-4 h-4 text-white hover:text-gray-200" />
                                </button>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="lote"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl"
                        >
                            Lote
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="venda">
                        <Card>
                            <CardContent className="grid grid-cols-2 gap-4 pt-4">
                                {renderVendaInfo(processamento)}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="cliente">
                        <Card>
                            <CardContent className="grid grid-cols-2 gap-4 pt-4">
                                {renderClienteInfo(processamento.cliente)}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="bandeira">
                        <Card>
                            <CardContent className="pt-4">
                                {renderBandeiraInfo(
                                    processamento.bandeira,
                                    processamento,
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="lote">
                        <Card>
                            <CardContent className="grid grid-cols-2 gap-4 pt-4">
                                {renderLoteInfo(processamento)}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="flex justify-end">
                    <BotaoPadrao
                        variant="outline"
                        name="Salvar alterações"
                        onClick={onSave}
                        icon={<Save className="w-5 h-5" />}
                    />
                </div>
                <AlertDialog open={isOpenModal} onOpenChange={setIsOpenModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{tituloModal}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {descricaoModal}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setConfirmacaoModal('')}
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => setConfirmacaoModal(tituloModal)}
                            >
                                Continuar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}