'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Processamento, ProcessamentoDTO } from '@/types/processamento';
import { Save } from 'lucide-react';
import { Bandeira } from '@/types/bandeira';
import InputItensCombobox from '@/components/Inputs/InputItensCombo';
import { listaPorClienteTipo } from '@/services/Bandeira';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useModalAvisoConfirmacao } from '@/context/ModalAvisoConfirmacaoContext';
import type { Client as Cliente } from '@/types/client';
import { lista as listaCliente } from '@/services/Cliente';
import InputPadrao from '@/components/Inputs/InputPadrao';
import CheckBoxPadrao from '@/components/Botoes/CheckBoxPadrao';
import SelectPadrao from '@/components/Inputs/SelectPadrao';
import { Badge } from '@/components/ui/badge';
import MensagemPadrao from '@/components/Util/MensagemPadrao';
import {listaPorClienteBandeira} from "@/services/Adquirente";

interface IncludeProcessamentoModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSaveAction: (processamento: ProcessamentoDTO) => void;
}

export function IncludeProcessamentoModal({
    isOpen,
    onCloseAction,
    onSaveAction,
}: IncludeProcessamentoModalProps) {
    const [nsuHost, setNsuHost] = useState('');
    const [qtdeParcelas, setQtdeParcelas] = useState(1);
    const [valorTotal, setValorTotal] = useState('');
    const [lancManual, setLancManual] = useState(true);
    const [dataTransacao, setDataTransacao] = useState<Date | null>(new Date());
    const [horaTransacao, setHoraTransacao] = useState('');
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
    const [bandeiraSearch, setBandeiraSearch] = useState('');
    const [selectedBandeira, setSelectedBandeira] = useState<Bandeira | null>(
        null,
    );
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteSearch, setClienteSearch] = useState('');
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(
        null,
    );
    const { setIsOpen, setTitulo, setDescricao, confirmacao, setConfirmacao } =
        useModalAvisoConfirmacao();
    const [placeholderBandeira, setPlaceholderBandeira] = useState<
        string | undefined
    >('Selecione um cliente para filtrar as bandeiras');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [adquirentes, setAdquirentes] = useState<any[]>([]);
    const [adquirenteSearch, setAdquirenteSearch] = useState('');
    const [selectedAdquirente, setSelectedAdquirente] = useState<any | null>(null);
    const [placeholderAdquirente, setPlaceholderAdquirente] = useState<
        string | undefined
    >('Selecione uma bandeira para filtrar as adquirentes');


    useEffect(() => {
        if (!isOpen) {
            setNsuHost('');
            setQtdeParcelas(1);
            setValorTotal('');
            setHoraTransacao('');
            setSelectedBandeira(null);
            setSelectedCliente(null);
        }
    }, [isOpen]);

    const fetchBandeiras = useCallback(
        async (filtro: any | null) => {
            if (selectedCliente) {
                setPlaceholderBandeira(undefined);
                const retorno = await listaPorClienteTipo(
                    filtro,
                    selectedCliente.id,
                );
                setBandeiras(retorno);
                return retorno;
            }
        },
        [selectedCliente],
    );

    const fetchAdquirentes = useCallback(
        async (filtro: any | null) => {
            if (selectedCliente && selectedBandeira) {
                setPlaceholderAdquirente(undefined);
                const retorno = await listaPorClienteBandeira(
                    selectedCliente.id,
                    selectedBandeira.id
                );

                setAdquirentes(retorno);
                return retorno;
            }
        },
        [selectedCliente, selectedBandeira],
    );


    const fetchClientes = useCallback(async (filtro: any | null) => {
        const retorno = await listaCliente(filtro);
        setClientes(retorno);
        return retorno;
    }, []);

    useEffect(() => {
        fetchBandeiras(bandeiraSearch);
    }, [bandeiraSearch, selectedCliente]);

    useEffect(() => {
        fetchClientes(clienteSearch);
    }, [clienteSearch]);

    useEffect(() => {
        fetchAdquirentes(adquirenteSearch);
    }, [adquirenteSearch, selectedCliente, selectedBandeira]);


    useEffect(() => {
        setLancManual(true);
    }, []);

    const onSave = () => {
        if (
            !selectedBandeira ||
            !selectedCliente ||
            !dataTransacao ||
            !selectedAdquirente ||
            errorMessage
        ) {
            setTitulo('Erro');
            setDescricao(
                'Por favor, preencha todos os campos obrigatórios ou corrija os erros.',
            );
            setIsOpen(true);
            setConfirmacao(false);
            return;
        }

        setTitulo('Confirmação');
        setDescricao('Deseja realmente salvar esse processamento?');
        setIsOpen(true);
    };

    useEffect(() => {
        if (confirmacao) {
            if (selectedBandeira && selectedCliente && errorMessage === null) {
                const dataTransacaoFormatada = dataTransacao
                    ? format(dataTransacao, 'yyyy-MM-dd', { locale: ptBR })
                    : '';

                const objProcessamento: ProcessamentoDTO = {
                    nsuHost,
                    qtdeParcelas,
                    valorTotal: parseFloat(valorTotal),
                    lancManual,
                    dataTransacao: dataTransacaoFormatada,
                    horaTransacao: horaTransacao,
                    bandeiraId: selectedBandeira.id,
                    clienteId: selectedCliente.id,
                    adquirenteId: selectedAdquirente.id,
                };
                onSaveAction(objProcessamento);
                setConfirmacao(false);
                onCloseAction();
            }
        }
    }, [confirmacao, dataTransacao, horaTransacao]);

    const handleValorTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value.replace(',', '.');
        const formattedValue = inputValue
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
        const regex = /^\d{0,5}(\.\d{0,2})?$/;

        if (regex.test(formattedValue)) {
            if (formattedValue.includes('.')) {
                const parts = formattedValue.split('.');
                if (parts[1].length > 2) {
                    return;
                }
            }
            setValorTotal(formattedValue);
        }
    };

    const handleParcelas = (valor: string | string[]) => {
        setQtdeParcelas(+valor);
    };

    useEffect(() => {
        if (selectedBandeira?.tipo === 'D' && qtdeParcelas > 1) {
            setErrorMessage(
                'Bandeira do tipo débito selecionada e quantidade de parcelas maior do que 1, para selecionar bandeiras do tipo débito é necessário selecionar apenas uma parcela.',
            );
        } else {
            setErrorMessage(null);
        }
    }, [selectedBandeira, qtdeParcelas]);

    return (
        <Dialog open={isOpen} onOpenChange={onCloseAction}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">
                        Novo Processamento
                    </DialogTitle>
                </DialogHeader>
                <Card>
                    {errorMessage && (
                        <MensagemPadrao tipo="erro" mensagem={errorMessage} />
                    )}
                    <CardContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="mb-4">
                            <InputPadrao
                                id={'nsuhost'}
                                name="nsuHost"
                                label={'Identificação (Nsu Host)'}
                                value={nsuHost}
                                onChange={(e) => setNsuHost(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <SelectPadrao
                                id="parcela"
                                name="parcela"
                                label="Parcela(s)"
                                value={qtdeParcelas.toString()}
                                onChange={handleParcelas}
                                options={[
                                    { value: '1', label: '1x' },
                                    { value: '2', label: '2x' },
                                    { value: '3', label: '3x' },
                                    { value: '4', label: '4x' },
                                    { value: '5', label: '5x' },
                                    { value: '6', label: '6x' },
                                    { value: '7', label: '7x' },
                                    { value: '8', label: '8x' },
                                    { value: '9', label: '9x' },
                                    { value: '10', label: '10x' },
                                    { value: '11', label: '11x' },
                                    { value: '12', label: '12x' },
                                ]}
                            />
                        </div>
                        <div className="mb-4">
                            <InputPadrao
                                id={'valorTotal'}
                                name="valorTotal"
                                label={'Valor Total'}
                                value={valorTotal}
                                onChange={handleValorTotalChange}
                            />
                        </div>
                        <div className="mb-4 flex items-center">
                            <CheckBoxPadrao
                                label="Lançamento Manual"
                                checked={lancManual}
                                onChange={setLancManual}
                                disabled
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Data da Transação
                            </label>
                            <Input
                                type="date"
                                value={
                                    dataTransacao
                                        ? format(dataTransacao, 'yyyy-MM-dd', {
                                              locale: ptBR,
                                          })
                                        : ''
                                }
                                onChange={(e) =>
                                    setDataTransacao(parseISO(e.target.value))
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Hora da Transação (Opcional)
                            </label>
                            <Input
                                type="time"
                                value={horaTransacao}
                                onChange={(e) =>
                                    setHoraTransacao(e.target.value)
                                }
                            />
                        </div>
                        <div className="mb-4 col-span-2">
                            <InputItensCombobox
                                titulo={'Cliente'}
                                data={clientes}
                                search={clienteSearch}
                                setSearch={setClienteSearch}
                                setSelected={setSelectedCliente}
                                selectedItem={selectedCliente}
                                campoMostrar={'nomeFantasia'}
                                width={584}
                            />
                        </div>
                        <div className="mb-4 col-span-2">
                            <InputItensCombobox
                                titulo={'Bandeira'}
                                placeholder={placeholderBandeira}
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
                                            <Badge className={`m-2 bg-primary`}>
                                                {selectedBandeira.tipo === 'D'
                                                    ? 'Débito'
                                                    : 'Crédito'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                        </div>
                        <div className="mb-4 col-span-2">
                            <InputItensCombobox
                                titulo={'Adquirente'}
                                placeholder={placeholderAdquirente}
                                data={adquirentes}
                                search={adquirenteSearch}
                                setSearch={setAdquirenteSearch}
                                setSelected={setSelectedAdquirente}
                                selectedItem={selectedAdquirente}
                                campoMostrar={'nome'}
                                width={584}
                            />
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <BotaoPadrao
                        variant="outline"
                        name="Salvar"
                        onClick={onSave}
                        icon={<Save className="w-5 h-5" />}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
