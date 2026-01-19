'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {Dialog, DialogClose, DialogContentClean as DialogContent,} from '@/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent} from '@/components/ui/card';
import type {Processamento} from '@/types/processamento';
import {ExternalLink, Save, X} from 'lucide-react';
import {Bandeira} from '@/types/bandeira';
import InputItensCombobox from '@/components/Inputs/InputItensCombo';
import {listaPorClienteTipo} from '@/services/Bandeira';
import {Badge} from '@/components/ui/badge';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import {useModalAvisoConfirmacao} from '@/context/ModalAvisoConfirmacaoContext';
import InputPadrao from '@/components/Inputs/InputPadrao';
import {lista} from '@/services/Bin';
import {useRouter} from 'next/navigation';
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
import {useToast} from "@/components/toast/ToastProvider";

interface ViewProcessamentoModalProps {
    processamento: Processamento | null;
    isOpen: boolean;
    onClose: () => void;
    onEditAction: (processamento: Processamento) => void;
}

type NavigationTarget = 'cliente' | 'bandeira' | null;

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
    const router = useRouter();
    const [tituloModal, setTituloModal] = useState<string>('');
    const [descricaoModal, setDescricaoModal] = useState<string>('');
    const [pendingNavigation, setPendingNavigation] =
        useState<NavigationTarget>(null);
    const [confirmedNavigation, setConfirmedNavigation] =
        useState<NavigationTarget>(null);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const { showToast } = useToast();

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

    useEffect(() => {
        const validarConflitoBandeira = async () => {
            if (
                processamento.bin &&
                selectedBandeira &&
                processamento.bandeira?.id !== selectedBandeira.id
            ) {
                const filtro = { bin: processamento.bin };
                const consultaBin = await lista(filtro);

                if (consultaBin.length > 0) {
                    for (const e of consultaBin) {
                        if (
                            e.bandeira.id !== selectedBandeira.id &&
                            e.bandeira.tipo === selectedBandeira.tipo
                        ) {
                            showToast(`Conflito de BIN.\nO BIN ${processamento.bin} pertence à bandeira ${e.bandeira.nome}.`, 'error');
                            break;
                        }
                    }
                }
            }
        };

        validarConflitoBandeira();
    }, [selectedBandeira, processamento.bin, processamento.bandeira]);

    const onSave = async () => {
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
                        errorMessageOnSave =
                            `Conflito de BIN!\n\n` +
                            `O BIN ${binDigitado} já está vinculado à bandeira:\n` +
                            `${e.bandeira.nome}.\n\n` +
                            `Antes de continuar, revise o cadastro de bandeiras para evitar inconsistências.`;
                        break;
                    }
                }
            } else {
                descricao =
                    `BIN sem vínculo!\n\n` +
                    `Este BIN ainda não possui nenhuma bandeira associada.\n\n` +
                    `Ao continuar:\n` +
                    `• O BIN será automaticamente vinculado à bandeira selecionada\n` +
                    `• Outros processamentos com o mesmo BIN também serão impactados`;
            }

            if (errorMessageOnSave) {
                showToast(errorMessageOnSave, "error");
                return;
            }
        }

        setTitulo('Confirmação de alteração');

        setDescricao(
            descricao ||
            (
                processamento.bandeira
                    ? `Você está prestes a alterar a bandeira deste processamento.\n\n` +
                    `O que muda:\n` +
                    `• Apenas este processamento será afetado\n` +
                    `• Outros registros com o mesmo BIN NÃO serão alterados\n\n` +
                    `Para alterações em massa, utilize o cadastro de bandeiras.`
                    : `Você está prestes a definir uma bandeira para este processamento.\n\n` +
                    `O que vai acontecer:\n` +
                    `• O BIN será vinculado à bandeira selecionada\n` +
                    `• Outros processamentos com o mesmo BIN também serão impactados\n\n` +
                    `Deseja continuar?`
            )
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

    const renderInfoItem = (
        label: string,
        value: string | number,
        taxaInfo?: { color: string; label: string },
        badgeInfo?: { color: string; label: string },
    ) => (
        <div
            className="
      flex flex-col gap-1
      rounded-xl
      bg-white
      border
      px-3 py-2
      shadow-sm
      transition-all duration-200
      hover:shadow-md
    "
        >
            {/* LABEL */}
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </span>

            {/* VALOR + METADATA */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* VALOR */}
                <span className="text-sm font-semibold text-gray-900 break-all">
        {value}
      </span>

                {/* TAXA / METADATA LEVE */}
                {taxaInfo && (
                    <span
                        className="
            text-xs font-medium
            text-gray-600
            bg-gray-100
            px-2 py-0.5
            rounded-md
            whitespace-nowrap
          "
                    >
          {taxaInfo.label}
        </span>
                )}

                {/* STATUS (único caso que usa Badge) */}
                {badgeInfo && (
                    <Badge
                        variant="secondary"
                        className="
            text-xs
            h-auto
            px-2 py-0.5
            whitespace-nowrap
          "
                    >
                        {badgeInfo.label}
                    </Badge>
                )}
            </div>
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
            {renderInfoItem(
                'Taxa',
                `${(processamento.taxa ?? 0).toFixed(2)}%`,
                { color: 'gray', label: 'Percentual' }
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
            {renderInfoItem(
                'Lançamento Manual',
                processamento.lancManual ? 'Sim' : 'Não',
                undefined,
                {
                    color: processamento.lancManual ? 'red' : 'green',
                    label: processamento.lancManual ? 'Manual' : 'Automático',
                }
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

    const renderLoteInfo = (processamento: Processamento) => (
        <div
            className="
      rounded-2xl
      bg-white
      border
      shadow-sm
      p-4
      flex flex-col gap-4
      transition-all duration-200
      hover:shadow-md
    "
        >
            {/* LOTE */}
            {processamento.lote ? (
                <div className="flex items-center justify-between">
                    <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Lote
          </span>
                        <div className="text-lg font-semibold text-gray-900">
                            #{processamento.lote.id}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500 italic">
                    Este processamento não pertence a um lote.
                </div>
            )}

            {/* DIVISOR */}
            <div className="h-px bg-gray-200" />

            {/* PAGAMENTO */}
            <div>
      <span className="text-xs font-medium text-gray-500 uppercase">
        Previsão de Pagamento
      </span>
                <div className="text-sm font-semibold text-gray-900">
                    {processamento.dataPagamento}
                </div>
            </div>
        </div>
    );

    const handleBandeiraNavigation = () => {
        setTituloModal('Bandeira');
        setDescricaoModal(
            'Deseja realmente navegar para o cadastro da bandeira? Essa ação leva para a página de cadastros, saindo da página de processamentos.'
        );
        setPendingNavigation('bandeira');
        setIsOpenModal(true);
    };

    const handleClienteNavigation = () => {
        setTituloModal('Cliente');
        setDescricaoModal(
            'Deseja realmente navegar para o cadastro do cliente? Essa ação leva para a página de cadastros, saindo da página de processamentos.'
        );
        setPendingNavigation('cliente');
        setIsOpenModal(true);
    };

    useEffect(() => {
        if (!confirmedNavigation) return;

        if (confirmedNavigation === 'cliente') {
            router.push('/cadastros/clientes');
            setTimeout(() => {
                router.push(`/cadastros/clientes/${processamento?.cliente.id}`);
            }, 300);
        }

        if (confirmedNavigation === 'bandeira') {
            router.push('/cadastros/bandeiras');
            setTimeout(() => {
                router.push(`/cadastros/bandeiras/${processamento?.bandeira.id}`);
            }, 300);
        }

        setConfirmedNavigation(null);
        setPendingNavigation(null);
        setIsOpenModal(false);
    }, [confirmedNavigation]);


    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent
                role="dialog"
                aria-modal="true"
                aria-labelledby="processamento-title"
                className="
                    max-w-4xl h-[90vh]
                    p-0 flex flex-col
                    overflow-hidden
                    bg-gray-50
                    [&_[data-radix-dialog-close]]:hidden
                  "
            >
                <DialogClose
                    aria-label="Fechar"
                    className="
      absolute top-3 right-3
      z-30
      rounded-full
      p-2
      text-white
      bg-black/20
      hover:bg-black/40
      transition
      focus:outline-none
      focus:ring-2
      focus:ring-white
    "
                >
                    <X className="h-4 w-4" />
                </DialogClose>
                {/* ================= HEADER ================= */}
                <header className="
        px-6 py-4
        bg-gradient-to-r from-primary to-primary/80
        text-white
        shadow-md
        z-20
      ">
                    <h2
                        id="processamento-title"
                        className="text-xl font-semibold"
                        tabIndex={-1}
                    >
                        Detalhes do Processamento
                    </h2>
                    <p className="text-sm opacity-90">
                        ID #{processamento.id} • {processamento.nomeProduto}
                    </p>
                </header>

                {/* ================= TABS ================= */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col min-h-0"
                >
                    {/* Tabs Header */}
                    <div className="sticky top-0 z-10 bg-gray-50">
                        <TabsList
                            role="tablist"
                            aria-label="Seções do processamento"
                            className="
              grid grid-cols-2 sm:grid-cols-4 gap-2
              p-4
            "
                        >
                            {['venda', 'cliente', 'bandeira', 'lote'].map(tab => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    className="
                  rounded-xl py-2 font-medium
                  bg-white border
                  shadow-sm
                  transition-all duration-200
                  hover:shadow-md hover:-translate-y-[1px]
                  data-[state=active]:bg-primary
                  data-[state=active]:text-white
                  data-[state=active]:shadow-lg
                  focus-visible:ring-2 focus-visible:ring-primary
                "
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* ================= CONTEÚDO ================= */}
                    <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">

                        {/* VENDA */}
                        <TabsContent value="venda">
                            <Card className="
              relative z-0
              rounded-2xl
              shadow-md
              transition-all duration-200
              hover:shadow-lg
            ">
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                                    {renderVendaInfo(processamento)}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* CLIENTE */}
                        <TabsContent value="cliente">
                            <Card className="
              relative z-0
              rounded-2xl
              shadow-md
              transition-all duration-200
              hover:shadow-lg
            ">
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                                    {renderClienteInfo(processamento.cliente)}
                                </CardContent>

                                <div className="flex justify-end px-6 pb-4">
                                    <BotaoPadrao
                                        variant="outline"
                                        name="Abrir cadastro do cliente"
                                        icon={<ExternalLink className="w-4 h-4" />}
                                        onClick={handleClienteNavigation}
                                    />
                                </div>
                            </Card>
                        </TabsContent>

                        {/* BANDEIRA */}
                        <TabsContent value="bandeira">
                            <Card className="
              relative z-0
              rounded-2xl
              shadow-md
              transition-all duration-200
              hover:shadow-lg
            ">
                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>{processamento.nomeProduto}</Badge>
                                        <Badge variant="secondary">
                                            {processamento.tipoProduto === 'D' ? 'Débito' : 'Crédito'}
                                        </Badge>
                                    </div>

                                    <div className="max-w-xs">
                                        <InputPadrao
                                            type="text"
                                            id="bin"
                                            name="bin"
                                            label="BIN"
                                            value={binDigitado}
                                            onChange={(e) => setBinDigitado(e.target.value)}
                                            disabled={!!processamento.bin}
                                        />
                                    </div>

                                    <InputItensCombobox
                                        titulo="Bandeira"
                                        data={bandeiras}
                                        search={bandeiraSearch}
                                        setSearch={setBandeiraSearch}
                                        setSelected={setSelectedBandeira}
                                        selectedItem={selectedBandeira}
                                        campoMostrar="nome"
                                        width={480}
                                    />

                                    {selectedBandeira && (
                                        <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Tipo da bandeira:
                    </span>
                                            <Badge
                                                variant={
                                                    selectedBandeira.tipo === processamento.tipoProduto
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {selectedBandeira.tipo === 'D' ? 'Débito' : 'Crédito'}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                                <div className="flex justify-end px-6 pb-4">
                                    <BotaoPadrao
                                        variant="outline"
                                        name="Abrir cadastro da bandeira"
                                        icon={<ExternalLink className="w-4 h-4" />}
                                        onClick={handleBandeiraNavigation}
                                    />
                                </div>
                            </Card>
                        </TabsContent>

                        {/* LOTE */}
                        <TabsContent value="lote">
                            <Card className="
              relative z-0
              rounded-2xl
              shadow-md
              transition-all duration-200
              hover:shadow-lg
            ">
                                <CardContent className="pt-6">
                                    {renderLoteInfo(processamento)}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>

                {/* ================= FOOTER ================= */}
                <footer className="
        border-t bg-white
        px-6 py-4
        flex justify-end
        shadow-[0_-4px_12px_rgba(0,0,0,0.05)]
        z-20
      ">
                    <BotaoPadrao
                        variant="outline"
                        name="Salvar alterações"
                        onClick={onSave}
                        icon={<Save className="w-5 h-5" />}
                    />
                </footer>

                {/* ================= MODAL CONFIRMAÇÃO ================= */}
                <AlertDialog open={isOpenModal} onOpenChange={setIsOpenModal}>
                    <AlertDialogContent
                        className="
      max-w-md
      rounded-2xl
      p-6
      shadow-2xl
      border
      bg-white
    "
                    >
                        <AlertDialogHeader className="space-y-4">
                            {/* ÍCONE */}
                            <div
                                className="
          mx-auto
          flex h-14 w-14
          items-center justify-center
          rounded-full
          bg-primary/10
          text-primary
          shadow-inner
        "
                            >
                                <ExternalLink className="h-6 w-6" />
                            </div>

                            {/* TÍTULO */}
                            <AlertDialogTitle
                                className="
          text-center
          text-lg
          font-semibold
          text-gray-900
        "
                            >
                                {tituloModal}
                            </AlertDialogTitle>

                            {/* DESCRIÇÃO */}
                            <AlertDialogDescription
                                className="
          text-center
          text-sm
          leading-relaxed
          text-gray-600
          whitespace-pre-line
        "
                            >
                                {descricaoModal}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter
                            className="
        mt-6
        flex
        gap-3
      "
                        >
                            {/* CANCELAR */}
                            <AlertDialogCancel
                                className="
          flex-1
          rounded-xl
          border
          bg-white
          text-gray-700
          hover:bg-gray-50
          transition
        "
                                onClick={() => {
                                    setPendingNavigation(null);
                                    setIsOpenModal(false);
                                }}
                            >
                                Cancelar
                            </AlertDialogCancel>

                            {/* CONFIRMAR */}
                            <AlertDialogAction
                                className="
          flex-1
          rounded-xl
          bg-primary
          text-white
          hover:bg-primary/90
          shadow-md
          transition
        "
                                onClick={() => {
                                    setConfirmedNavigation(pendingNavigation);
                                }}
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