"use client"

import React, {useState, useEffect} from "react"
import {
    X,
    Plus,
    Copy,
    Trash,
    Ban,
    Save,
    Undo2,
    Layers,
    AlignHorizontalJustifyCenter
} from "lucide-react"
import type {BandeirasCliente, BandeiraConfig} from "@/types/bandeirasCliente"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import MensagemPadrao, {IMensagemPadraoProps} from "@/components/Util/MensagemPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import {Encargo} from "@/types/encargo";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";

interface BandeiraConfigModalProps {
    bandeiraCliente: BandeirasCliente
    isOpen: boolean
    onCloseAction: () => void
    onSaveAction: (bandeiraCliente: BandeirasCliente) => void
}

export default function BandeiraConfigModal({
                                                bandeiraCliente,
                                                isOpen,
                                                onCloseAction,
                                                onSaveAction,
                                            }: BandeiraConfigModalProps) {
    if (!isOpen) return null
    const [editingConfigs, setEditingConfigs] = useState<BandeiraConfig[]>([])
    const [editingEncargos, setEditingEncargos] = useState<Encargo[]>([])
    const [message, setMessage] = useState<IMensagemPadraoProps | null>(null);
    const [activeTab, setActiveTab] = useState<'alinhamento' | 'encargos'>('alinhamento');

    // O estado 'mesmoDia' foi removido, pois a lógica será controlada por linha.

    useEffect(() => {
        if (isOpen) {
            if (bandeiraCliente.bandeirasConfig) {
                // Garante que o valor de 'diasPagamento' nunca seja nulo para evitar erros.
                const safeConfigs = bandeiraCliente.bandeirasConfig.map(c => ({
                    ...c,
                    diasPagamento: c.diasPagamento ?? 1, // Define 1 como padrão se for nulo/undefined
                })).sort((a, b) => a.parcela - b.parcela);
                setEditingConfigs(safeConfigs || [])
            }
            if (bandeiraCliente.encargos) {
                const safeEncargos = bandeiraCliente.encargos.map(e => ({
                    ...e,
                    mensal: e.mensal || false,
                    porLote: e.porLote || false,
                    porTransacao: e.porTransacao || false,
                }));
                setEditingEncargos(safeEncargos || [])
            }
        }
    }, [isOpen, bandeiraCliente])

    const validateParcelaSequence = (parcela: number, configs: BandeiraConfig[]): string | null => {
        if (parcela > 1 && !configs.some((config) => config.parcela === parcela - 1)) {
            return `Não é possível adicionar a parcela ${parcela} sem configurar a parcela ${parcela - 1} primeiro.`
        }
        return null
    }

    const handleAddConfig = (e: any) => {
        e.preventDefault();
        const lastConfig = editingConfigs[editingConfigs.length - 1]
        const nextParcela = lastConfig ? lastConfig.parcela + 1 : 1

        const newConfig: BandeiraConfig = {
            id: null,
            parcela: nextParcela,
            taxa: 0,
            diasPagamento: 1, // Inicia com o valor padrão 1
        }
        if (editingConfigs.some((config) => config.parcela === nextParcela)) {
            setMessage({
                mensagem: `Já existe uma configuração para a parcela ${nextParcela}`,
                tipo: 'aviso'
            })
            return
        }

        const sequenceError = validateParcelaSequence(nextParcela, editingConfigs)
        if (sequenceError) {
            setMessage({
                mensagem: sequenceError,
                tipo: 'info'
            })
            return
        }

        setMessage(null)
        setEditingConfigs([...editingConfigs, newConfig])
    }

    const handleUpdateBandeiraConfig = (updatedConfig: Partial<BandeiraConfig>) => {
        const parcela = updatedConfig.parcela?.toString() === "" ? "" : Number(updatedConfig.parcela)

        const sequenceError = validateParcelaSequence(
            parcela as number,
            editingConfigs.filter((config) => config.parcela !== updatedConfig.parcela),
        )
        if (sequenceError) {
            setMessage({
                mensagem: sequenceError,
                tipo: 'info'
            })
            return
        }

        // Lógica de `diasPagamento` foi simplificada, pois agora é tratada no onChange dos componentes.
        const newConfig = {
            ...updatedConfig,
            parcela,
            taxa: updatedConfig.taxa === 0 ? 0 : parseFloat(updatedConfig.taxa as unknown as string),
            diasPagamento: Number(updatedConfig.diasPagamento),
        }

        setMessage(null)
        setEditingConfigs(
            editingConfigs.map((config) => (config.parcela === newConfig.parcela ? (newConfig as BandeiraConfig) : config)),
        )
    }

    const handleDuplicateConfig = (config: BandeiraConfig) => {
        const nextParcela = config.parcela + 1
        if (editingConfigs.some((config) => config.parcela === nextParcela)) {
            setMessage({
                mensagem: `Já existe uma configuração para a parcela ${nextParcela}`,
                tipo: 'aviso'
            })
            return
        }

        const sequenceError = validateParcelaSequence(nextParcela, editingConfigs)
        if (sequenceError) {
            setMessage({
                mensagem: sequenceError,
                tipo: 'info'
            })
            return
        }

        const newConfig: BandeiraConfig = {
            ...config,
            id: null,
            parcela: nextParcela,
        }

        setMessage(null)
        setEditingConfigs([...editingConfigs, newConfig])
    }

    const handleDeleteConfig = (parcela: number) => {
        const configToDelete = editingConfigs.find((config) => config.parcela === parcela);
        if (configToDelete) {
            const hasSubsequentParcela = editingConfigs.some((config) => config.parcela > configToDelete.parcela && !config.deleta);
            if (hasSubsequentParcela) {
                setMessage({
                    mensagem: `Não é possível excluir a parcela ${configToDelete.parcela} pois existe uma configuração para a parcela ${configToDelete.parcela + 1}.`,
                    tipo: 'erro'
                });
                return;
            }
        }
        setEditingConfigs(editingConfigs.map(config => {
            if (config.parcela === parcela) {
                return {...config, deleta: true};
            }
            return config;
        }));
    }

    const handleUndoDeleteConfig = (parcela: number) => {
        setMessage(null);
        const configToUndo = editingConfigs.find((config) => config.parcela === parcela);
        if (configToUndo) {
            const hasAntParcela = editingConfigs.some((config) => config.parcela < configToUndo.parcela && config.deleta === true);
            if (hasAntParcela) {
                setMessage({
                    mensagem: `Não é possível reativar a parcela ${configToUndo.parcela} pois foi deletada uma configuração para a parcela ${configToUndo.parcela - 1}.`,
                    tipo: 'erro'
                });
                return;
            }
        }
        setEditingConfigs(editingConfigs.map(config => {
            if (config.parcela === parcela) {
                return {...config, deleta: false};
            }
            return config;
        }));
    }

    // --- A lógica de Encargos permanece a mesma ---
    const handleAddEncargo = (e: any) => {
        e.preventDefault();
        const newEncargo: Encargo = {
            id: null,
            descricaoEncargo: '',
            valorEncargo: 0,
            porPorcentagem: false,
            mensal: true,
            porLote: false,
            porTransacao: false,
        };
        setEditingEncargos([...editingEncargos, newEncargo]);
    };

    const handleUpdateEncargo = (updatedEncargo: Partial<Encargo>, index: number) => {
        const newEncargos = [...editingEncargos];
        newEncargos[index] = {...newEncargos[index], ...updatedEncargo};
        setEditingEncargos(newEncargos);
    };

    const handleChargeTypeChange = (type: 'mensal' | 'lote' | 'transacao', index: number) => {
        const update: Partial<Encargo> = {
            mensal: type === 'mensal',
            porLote: type === 'lote',
            porTransacao: type === 'transacao',
        };
        handleUpdateEncargo(update, index);
    };


    const handleDeleteEncargo = (index: number) => {
        const newEncargos = [...editingEncargos];
        newEncargos.splice(index, 1);
        setEditingEncargos(newEncargos);
    };

    const handleSave = () => {
        onSaveAction({
            ...bandeiraCliente,
            bandeirasConfig: editingConfigs,
            encargos: editingEncargos,
        })
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-lg p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2'
                                  titulo={`Configurações - ${bandeiraCliente.bandeira && bandeiraCliente.bandeira.nome}`}/>
                    <BotaoPadrao
                        variant='ghost'
                        onClick={onCloseAction}
                        name='Fechar'
                        icon={<X size={24}/>}
                    />
                </div>

                <div className="flex space-x-2 mb-4 border-b p-2">
                    <BotaoPadrao
                        variant={activeTab === 'alinhamento' ? 'outline' : 'ghost'}
                        onClick={() => setActiveTab('alinhamento')}
                        name='Alinhamento'
                        icon={<AlignHorizontalJustifyCenter className='h-4 w-4'/>}
                    />
                    <BotaoPadrao
                        variant={activeTab === 'encargos' ? 'outline' : 'ghost'}
                        onClick={() => setActiveTab('encargos')}
                        name='Encargos'
                        icon={<Layers className='h-4 w-4'/>}
                    />
                </div>

                {activeTab === 'alinhamento' && (
                    <div>
                        <div className="mb-4">
                            <BotaoPadrao
                                variant='outline'
                                onClick={handleAddConfig}
                                name='Adicionar Configuração'
                                icon={<Plus className="h-5 w-5 mr-2"/>}
                                className='mb-4'
                            />
                            {message && (
                                <MensagemPadrao
                                    mensagem={message.mensagem}
                                    tipo={message.tipo}
                                />
                            )}
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Parcela
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dias Pagamento
                                </th>
                                {/* A coluna "Mesmo Dia" foi removida para unificar a lógica */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {editingConfigs.map((config) => (
                                <tr key={config.parcela} className={config.deleta ? 'opacity-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <InputPadrao
                                            disabled={config.deleta}
                                            id='parcela'
                                            label='Parcela'
                                            name='Parcela'
                                            type='number'
                                            value={config.parcela || ""}
                                            onChange={(e) =>
                                                handleUpdateBandeiraConfig({
                                                    ...config,
                                                    parcela: parseInt(e.target.value) || 1
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <InputPadrao
                                            disabled={config.deleta}
                                            step="0.01"
                                            id='taxa'
                                            label='Taxa'
                                            name='Taxa'
                                            type='number'
                                            value={config.taxa || 0}
                                            onChange={(e) => {
                                                let value = e.target.value.replaceAll(',', '.');
                                                handleUpdateBandeiraConfig({
                                                    ...config,
                                                    taxa: parseFloat(value) || 0,
                                                })
                                            }}
                                        />
                                    </td>

                                    {/* SEÇÃO MODIFICADA E UNIFICADA */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-4">
                                            <InputPadrao
                                                disabled={config.deleta || config.diasPagamento === 0}
                                                id={`diasPagamento-${config.parcela}`}
                                                label='Dias'
                                                name='Dias Pagamento'
                                                type='number'
                                                value={config.diasPagamento === 0 ? 1 : config.diasPagamento}
                                                onChange={(e) => {
                                                    const days = parseInt(e.target.value);
                                                    handleUpdateBandeiraConfig({
                                                        ...config,
                                                        diasPagamento: days > 0 ? days : 1,
                                                    });
                                                }}
                                            />
                                            <CheckBoxPadrao
                                                disabled={config.deleta}
                                                label="No mesmo dia"
                                                checked={config.diasPagamento === 0}
                                                onChange={(isChecked) => {
                                                    handleUpdateBandeiraConfig({
                                                        ...config,
                                                        diasPagamento: isChecked ? 0 : 1,
                                                    });
                                                }}
                                            />
                                        </div>
                                    </td>
                                    {/* FIM DA SEÇÃO MODIFICADA */}

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <BotaoPadrao
                                                disabled={config.deleta}
                                                variant='ghost'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDuplicateConfig(config);
                                                }}
                                                icon={<Copy className="h-5 w-5"/>}
                                            />
                                            {!config.deleta ? (
                                                <BotaoPadrao
                                                    variant='destructive'
                                                    transparent
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteConfig(config.parcela);
                                                    }}
                                                    icon={<Trash className="h-5 w-5"/>}
                                                />
                                            ) : (
                                                <BotaoPadrao
                                                    variant='ghost'
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleUndoDeleteConfig(config.parcela);
                                                    }}
                                                    icon={<Undo2 className="h-5 w-5"/>}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'encargos' && (
                    /* Conteúdo da aba de encargos (sem alterações lógicas) */
                    <div>
                        <div className="mb-4">
                            <BotaoPadrao
                                variant='outline'
                                onClick={handleAddEncargo}
                                name='Adicionar Encargo'
                                icon={<Plus className="h-5 w-5 mr-2"/>}
                                className='mb-4'
                            />
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">
                                    Descrição
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">
                                    Tipo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {editingEncargos.map((encargo, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <InputPadrao
                                            id={`descricao-${index}`}
                                            label='Descrição do encargo'
                                            name='Descricao'
                                            type='text'
                                            value={encargo.descricaoEncargo}
                                            onChange={(e) => handleUpdateEncargo({descricaoEncargo: e.target.value}, index)}
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <InputPadrao
                                                id={`valor-${index}`}
                                                label='Valor'
                                                name='Valor'
                                                type='number'
                                                step="0.01"
                                                value={encargo.valorEncargo}
                                                onChange={(e) => handleUpdateEncargo({valorEncargo: parseFloat(e.target.value) || 0}, index)}
                                            />
                                            <CheckBoxPadrao
                                                label="%"
                                                checked={encargo.porPorcentagem || false}
                                                onChange={(e) => handleUpdateEncargo({porPorcentagem: e}, index)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id={`mensal-${index}`}
                                                    name={`charge-type-${index}`}
                                                    checked={encargo.mensal}
                                                    onChange={() => handleChargeTypeChange('mensal', index)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <label htmlFor={`mensal-${index}`} className="ml-2 block text-sm text-gray-900">
                                                    Mensal
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id={`lote-${index}`}
                                                    name={`charge-type-${index}`}
                                                    checked={encargo.porLote}
                                                    onChange={() => handleChargeTypeChange('lote', index)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <label htmlFor={`lote-${index}`} className="ml-2 block text-sm text-gray-900">
                                                    Por Lote
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id={`transacao-${index}`}
                                                    name={`charge-type-${index}`}
                                                    checked={encargo.porTransacao}
                                                    onChange={() => handleChargeTypeChange('transacao', index)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <label htmlFor={`transacao-${index}`} className="ml-2 block text-sm text-gray-900">
                                                    Por Transação
                                                </label>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <BotaoPadrao
                                            variant='destructive'
                                            transparent
                                            onClick={() => handleDeleteEncargo(index)}
                                            icon={<Trash className="h-5 w-5"/>}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-8 flex justify-end space-x-4">
                    <BotaoPadrao
                        variant="outline"
                        onClick={onCloseAction}
                        name={'Cancelar'}
                        icon={<Ban className="w-4 h-4 font-bold mr-2"/>}
                    />
                    <BotaoPadrao
                        variant="outline"
                        onClick={handleSave}
                        name={'Salvar'}
                        icon={<Save className="w-4 h-4 font-bold mr-2"/>}
                    />
                </div>
            </div>
        </div>
    )
}