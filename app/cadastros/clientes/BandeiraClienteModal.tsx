'use client';

import type { Bandeira } from '@/types/bandeira';
import type { Banco } from '@/types/banco';
import type { Adquirente } from '@/types/adquirente';
import type { BandeirasCliente } from '@/types/bandeirasCliente';
import React, { useCallback, useEffect, useState } from 'react';
import TituloPadrao from '@/components/Titulos/TituloPadrao';
import MensagemPadrao from '@/components/Util/MensagemPadrao';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import { Ban, Save } from 'lucide-react';
import InputPadrao from '@/components/Inputs/InputPadrao';
import { lista as listaBandeiras } from '@/services/Bandeira';
import { lista as listaBancos } from '@/services/Banco';
import { lista as listaAdquirentes } from '@/services/Adquirente';
import InputItensCombobox from '@/components/Inputs/InputItensCombo';
import CalendarioFalso from '@/components/Inputs/CalendarioFalso'; // Mantido

interface BandeiraClienteModalProps {
    isOpen: boolean;
    bandeiraClienteSelecionada?: BandeirasCliente | undefined;
    onSaveAction: (bandeiraCliente: BandeirasCliente) => void;
    onCloseAction: () => void;
    existingBandeiras: BandeirasCliente[];
}

export default function BandeiraClienteModal({
                                                 bandeiraClienteSelecionada,
                                                 existingBandeiras,
                                                 onCloseAction,
                                                 onSaveAction,
                                                 isOpen,
                                             }: BandeiraClienteModalProps) {
    if (!isOpen) return null;

    const diasDaSemana = [
        { valor: 0, nome: 'Não se aplica (Opcional)' },
        { valor: 1, nome: 'Domingo' },
        { valor: 2, nome: 'Segunda-feira' },
        { valor: 3, nome: 'Terça-feira' },
        { valor: 4, nome: 'Quarta-feira' },
        { valor: 5, nome: 'Quinta-feira' },
        { valor: 6, nome: 'Sexta-feira' },
        { valor: 7, nome: 'Sábado' },
    ];

    const [newBandeiraCliente, setNewBandeiraCliente] =
        useState<BandeirasCliente>({
            bandeira: undefined,
            id: -1,
            bandeirasConfig: [],
            adquirente: undefined,
            agencia: '',
            banco: undefined,
            conta: '',
            diasPagamento: 0,
            deleta: false,
            diaFixo: '', // Alterado para string para múltiplos dias
            diaSemanaCorte: 0,
        });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [bandeira, setBandeira] = useState<Bandeira[]>([]);
    const [banco, setBanco] = useState<Banco[]>([]);
    const [adquirente, setAdquirente] = useState<Adquirente[]>([]);
    const [bandeiraSearch, setBandeiraSearch] = useState('');
    const [bancoSearch, setBancoSearch] = useState('');
    const [adquirenteSearch, setAdquirenteSearch] = useState('');
    const [filteredBandeira, setFilteredBandeira] = useState<Bandeira[]>([]);
    const [filteredBanco, setFilteredBanco] = useState<Banco[]>([]);
    const [filteredAdquirente, setFilteredAdquirente] = useState<Adquirente[]>(
        [],
    );

    // Inicializa showDiaFixoCalendar com base em se bandeiraClienteSelecionada.diaFixo é uma string não vazia
    const [showDiaFixoCalendar, setShowDiaFixoCalendar] = useState(
        bandeiraClienteSelecionada ? (bandeiraClienteSelecionada.diaFixo || '').toString().trim().length > 0 : false
    );

    const isEditingBandeiraCliente = bandeiraClienteSelecionada !== undefined;

    // Ajusta o useEffect para lidar com valores nulos/indefinidos de diaFixo
    useEffect(() => {
        if (bandeiraClienteSelecionada) {
            setNewBandeiraCliente({
                ...bandeiraClienteSelecionada,
                diaFixo: (bandeiraClienteSelecionada.diaFixo || '').toString(), // Garante que diaFixo seja string
            });
            // Define showDiaFixoCalendar como true APENAS se diaFixo for uma string não vazia
            setShowDiaFixoCalendar((bandeiraClienteSelecionada.diaFixo || '').toString().trim().length > 0);
        } else {
            // Garante que o estado seja resetado para um novo item
            setNewBandeiraCliente({
                bandeira: undefined,
                id: -1,
                bandeirasConfig: [],
                adquirente: undefined,
                agencia: '',
                banco: undefined,
                conta: '',
                diasPagamento: 0,
                deleta: false,
                diaFixo: '', // Reinicia como string vazia
                diaSemanaCorte: 0,
            });
            setShowDiaFixoCalendar(false); // Garante que o checkbox seja desmarcado ao resetar
        }
    }, [bandeiraClienteSelecionada]);

    const fetchBandeira = useCallback(async (filtro: string | null) => {
        const retorno = await listaBandeiras(filtro);
        setBandeira(retorno);
        return retorno;
    }, []);

    const fetchBanco = useCallback(async (filtro: string | null) => {
        const retorno = await listaBancos(filtro);
        setBanco(retorno);
        return retorno;
    }, []);

    const fetchAdquirente = useCallback(async (filtro: string | null) => {
        const retorno = await listaAdquirentes(filtro);
        setAdquirente(retorno);
        return retorno;
    }, []);

    useEffect(() => {
        fetchBandeira(null);
        fetchBanco(null);
        fetchAdquirente(null);
    }, [fetchAdquirente, fetchBanco, fetchBandeira]); // Adicionei as dependências para useCallback

    const handleBandeiraSelect = (bandeira: Bandeira) => {
        setNewBandeiraCliente((prev) => ({ ...prev, bandeira }));
        if (bandeira && bandeira.nome) {
            setBandeiraSearch(bandeira.nome);
        }
    };

    const handleBancoSelect = (banco: Banco) => {
        setNewBandeiraCliente((prev) => ({ ...prev, banco }));
        if (banco && banco.nome) {
            setBancoSearch(banco.nome);
        }
    };

    const handleAdquirenteSelect = (adquirente: Adquirente) => {
        setNewBandeiraCliente((prev) => ({ ...prev, adquirente }));
        setAdquirenteSearch(adquirente.nome);
    };

    useEffect(() => {
        fetchBandeira(bandeiraSearch.toLowerCase()).then((e) => {
            setFilteredBandeira(e);
        });
    }, [bandeiraSearch, fetchBandeira]); // Adicionei fetchBandeira como dependência

    useEffect(() => {
        fetchBanco(bancoSearch.toLowerCase()).then((e) => {
            setFilteredBanco(e);
        });
    }, [bancoSearch, fetchBanco]); // Adicionei fetchBanco como dependência

    useEffect(() => {
        fetchAdquirente(adquirenteSearch.toLowerCase()).then((e) => {
            setFilteredAdquirente(e);
        });
    }, [adquirenteSearch, fetchAdquirente]); // Adicionei fetchAdquirente como dependência

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação adicional para bandeira e adquirente
        if (!newBandeiraCliente.bandeira || !newBandeiraCliente.adquirente) {
            setErrorMessage("Por favor, selecione a Bandeira e o Adquirente.");
            return;
        }

        // Validação do formato de diaFixo: pode ser vazio ou uma lista de números separados por ;
        if (showDiaFixoCalendar && newBandeiraCliente.diaFixo && !/^(?:\d{1,2}(?:;\d{1,2})*)?$/.test(newBandeiraCliente.diaFixo)) {
            setErrorMessage("Formato inválido para 'Dia Fixo de Corte no Mês'. Use números separados por ponto e vírgula (ex: 1;15;30).");
            return;
        }
        // Valida que os dias sejam entre 1 e 31
        if (showDiaFixoCalendar && newBandeiraCliente.diaFixo) {
            const dias = newBandeiraCliente.diaFixo.split(';').map(Number);
            // Verifica se há algum dia inválido (fora do range 1-31 ou não é número)
            if (dias.some(dia => dia < 1 || dia > 31 || isNaN(dia))) {
                setErrorMessage("Os dias fixos devem ser números entre 1 e 31.");
                return;
            }
        }


        const bandeiraClienteParaSalvar = {
            ...newBandeiraCliente,
            // A propriedade 'bandeira' já é um objeto Bandeira em newBandeiraCliente,
            // então não é necessário recriá-lo com as mesmas propriedades.
            // No entanto, se a tipagem Bandeira no backend for mais simples,
            // você pode precisar mapear apenas o ID.
            // Para manter a consistência com o que você já tinha:
            bandeira: newBandeiraCliente.bandeira ? {
                id: newBandeiraCliente.bandeira.id,
                nome: newBandeiraCliente.bandeira.nome,
                tipo: newBandeiraCliente.bandeira.tipo,
                tipoAdicional: newBandeiraCliente.bandeira.tipoAdicional,
                diasPagamento: newBandeiraCliente.diasPagamento,
                diaSemanaCorte: newBandeiraCliente.diaSemanaCorte,
                diaFixo: newBandeiraCliente.diaFixo, // diaFixo já é string
            } : undefined, // Garante que seja undefined se não houver bandeira
        };

        const existingBandeira = existingBandeiras.find(
            (b) =>
                b.bandeira?.id === bandeiraClienteParaSalvar.bandeira?.id &&
                b.adquirente?.id ===
                bandeiraClienteParaSalvar.adquirente?.id &&
                b.id !== bandeiraClienteSelecionada?.id,
        );

        if (existingBandeira) {
            setErrorMessage(
                `Bandeira: ${bandeiraClienteParaSalvar.bandeira?.nome} e adquirente: ${bandeiraClienteParaSalvar.adquirente?.nome} já vinculados ao cliente.`,
            );
        } else {
            setErrorMessage(null);
            onSaveAction(bandeiraClienteParaSalvar);
            onCloseAction();
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { value, id } = e.target;
        let newValue: string | number = value;

        if (id === 'diasPagamento') {
            newValue = Math.max(0, parseInt(value, 10) || 0);
        } else if (id === 'diaSemanaCorte') {
            newValue = parseInt(value, 10) || 0;
        }
        // diaFixo agora é tratado exclusivamente pelo CalendarioFalso e seu onSelect
        // Não é mais um InputPadrao para digitação direta aqui
        setNewBandeiraCliente((prev) => ({ ...prev, [id]: newValue }));
    };

    // Nova função para lidar com a seleção de dias do CalendarioFalso
    const handleDiaFixoSelect = (updatedDaysString: string) => {
        setNewBandeiraCliente((prev) => ({
            ...prev,
            diaFixo: updatedDaysString,
            diaSemanaCorte: 0, // Garante que diaSemanaCorte seja 0 quando diaFixo é selecionado
        }));
        // Se a string de dias estiver vazia (usuário clicou em "Não se aplica"), desmarca o checkbox
        if (updatedDaysString === '') {
            setShowDiaFixoCalendar(false);
        }
    };

    const toggleDiaFixoCalendar = () => {
        setShowDiaFixoCalendar((prev) => {
            const newShowState = !prev;
            if (!newShowState) {
                setNewBandeiraCliente((current) => ({
                    ...current,
                    diaFixo: '', // Redefine diaFixo para string vazia (Não se aplica)
                    diaSemanaCorte: 0, // Garante que diaSemanaCorte seja 0
                }));
            } else {
                setNewBandeiraCliente((current) => ({
                    ...current,
                    diaSemanaCorte: 0, // Garante que diaSemanaCorte seja 0 ao ativar dia fixo
                }));
            }
            return newShowState;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <TituloPadrao
                    tamanho="h2"
                    titulo={
                        isEditingBandeiraCliente
                            ? 'Editar Bandeira do Cliente'
                            : 'Adicionar Bandeira do Cliente'
                    }
                />
                {errorMessage && (
                    <MensagemPadrao tipo="erro" mensagem={errorMessage} />
                )}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="relative">
                        <InputItensCombobox
                            titulo={'Bandeira'}
                            data={bandeira}
                            selectedItem={newBandeiraCliente.bandeira}
                            campoMostrar={'nome'}
                            search={bandeiraSearch}
                            setSearch={setBandeiraSearch}
                            setSelected={handleBandeiraSelect}
                            width={400}
                            hideLabel
                        />
                    </div>
                    <div className="relative">
                        <InputItensCombobox
                            titulo={'Banco'}
                            data={banco}
                            selectedItem={newBandeiraCliente.banco}
                            campoMostrar={'nome'}
                            search={bancoSearch}
                            setSearch={setBancoSearch}
                            setSelected={handleBancoSelect}
                            width={400}
                            hideLabel
                        />
                    </div>
                    <div className="relative">
                        <InputItensCombobox
                            titulo={'Adquirente'}
                            data={adquirente}
                            selectedItem={newBandeiraCliente.adquirente}
                            campoMostrar={'nome'}
                            search={adquirenteSearch}
                            setSearch={setAdquirenteSearch}
                            setSelected={handleAdquirenteSelect}
                            width={400}
                            hideLabel
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type="text"
                            id="agencia"
                            name="agencia"
                            value={newBandeiraCliente.agencia}
                            onChange={handleInputChange}
                            label="Agência"
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type="text"
                            id="conta"
                            name="conta"
                            value={newBandeiraCliente.conta}
                            onChange={handleInputChange}
                            label="Conta"
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type="number"
                            id="diasPagamento"
                            name="diasPagamento"
                            value={newBandeiraCliente.diasPagamento}
                            onChange={handleInputChange}
                            label="Dias de Pagamento"
                        />
                    </div>
                    {/* Alteração para exibir o CalendarioFalso condicionalmente */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="toggleDiaFixo" className="block text-sm font-medium text-gray-700">
                                Definir Dia Fixo de Corte no Mês
                            </label>
                            <input
                                type="checkbox"
                                id="toggleDiaFixo"
                                checked={showDiaFixoCalendar}
                                onChange={toggleDiaFixoCalendar}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                        </div>
                        {showDiaFixoCalendar && (
                            <CalendarioFalso
                                selectedValues={newBandeiraCliente.diaFixo ? newBandeiraCliente.diaFixo : ''} // Passa a string de dias
                                onSelect={handleDiaFixoSelect} // Novo handler para múltiplos dias
                            />
                        )}
                        {!showDiaFixoCalendar && (
                            <div className="text-gray-500 text-sm mt-1">
                                Marque a caixa acima para definir um ou mais dias fixos.
                                {/* Mostra os dias fixos atuais apenas se não estiver vazio e o calendário não estiver visível */}
                                {newBandeiraCliente.diaFixo && newBandeiraCliente.diaFixo.length > 0 ? ` (Dias atuais: ${newBandeiraCliente.diaFixo})` : ""}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="diaSemanaCorte" className="block text-sm font-medium text-gray-700 mb-1">
                            Dia de Corte da Semana
                        </label>
                        <select
                            id="diaSemanaCorte"
                            name="diaSemanaCorte"
                            value={newBandeiraCliente.diaSemanaCorte || 0}
                            onChange={handleInputChange}
                            disabled={showDiaFixoCalendar}
                            className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm
                                ${showDiaFixoCalendar ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                        >
                            {diasDaSemana.map((dia) => (
                                <option key={dia.valor} value={dia.valor}>
                                    {dia.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <BotaoPadrao
                        variant="outline"
                        onClick={onCloseAction}
                        name="Cancelar"
                        icon={<Ban className="w-4 h-4 font-bold" />}
                    />
                    <BotaoPadrao
                        variant="outline"
                        onClick={handleSave}
                        name="Salvar"
                        icon={<Save className="w-4 h-4 font-bold" />}
                    />
                </div>
            </div>
        </div>
    );
}