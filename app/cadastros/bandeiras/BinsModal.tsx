"use client";

import {useState, useEffect} from "react";
import type {Bandeira} from "@/types/bandeira";
import type {Bin} from "@/types/bin";
import {X, Plus} from "lucide-react";
import React from "react";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import MensagemPadrao from "@/components/Util/MensagemPadrao";
import {ColumnDef} from "@tanstack/react-table";
import InputPadrao from "@/components/Inputs/InputPadrao";
import DataTablePadrao, {IDataTableProps} from "@/components/Tabelas/DataTablePadrao";
import {lista} from "@/services/Bin";

interface BinsModalProps {
    bandeira: Bandeira | null;
    isOpen: boolean;
    onCloseAction: () => void;
    onSaveAction: (bandeira: Bandeira) => void;
}

export default function BinsModal({
                                      bandeira,
                                      isOpen,
                                      onCloseAction,
                                      onSaveAction,
                                  }: BinsModalProps) {
    const [editedBins, setEditedBins] = useState<Bin[]>([]);
    const [newBin, setNewBin] = useState<Partial<Bin>>({bin: "", descricao: ""});
    const [editingBinId, setEditingBinId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showAddBinFields, setShowAddBinFields] = useState(false);

    useEffect(() => {
        if (bandeira && bandeira.bins) {
            setEditedBins([...bandeira.bins]);
        } else {
            setEditedBins([]);
        }
    }, [bandeira]);

    if (!isOpen || !bandeira) return null;

    const handleAddBinClick = async () => {
        if (bandeira && bandeira.tipo) {
            setErrorMessage(null);
            if (newBin.bin && newBin.descricao) {
                if (editedBins.some((bin) => bin.bin === newBin.bin)) {
                    setErrorMessage("Este BIN já foi adicionado.");
                    return;
                }
                const filtro = {
                    "bin": newBin.bin,
                    "tipo": newBin.tipo,
                }
                const consultaBin = await lista(filtro);
                if (consultaBin) {
                    for (const e of consultaBin) {
                        if (e.bandeira.id !== bandeira.id) {
                            setErrorMessage(`Este BIN já pertence a uma bandeira! Bandeira: ${e.bandeira.id} - ${e.bandeira.nome}`);
                            return;
                        }
                    }
                }
                const binToAdd: Bin = {
                    id: Date.now(),
                    bin: newBin.bin,
                    descricao: newBin.descricao,
                    tipo: bandeira.tipo,
                };
                setEditedBins([...editedBins, binToAdd]);
                setNewBin({bin: "", descricao: ""});
                setShowAddBinFields(false);
            }
        }
    };

    const handleRemoveBin = (deletedBin: Bin) => {
        setEditedBins(editedBins.filter((bin) => bin.id !== deletedBin.id));
    };

    const handleEditBin = (bin: Bin) => {
        setEditingBinId(bin.id);
        setNewBin({bin: bin.bin, descricao: bin.descricao});
        setShowAddBinFields(true);
    };

    const handleUpdateBin = () => {
        setErrorMessage(null);
        if (newBin.bin && newBin.descricao && editingBinId !== null) {
            if (editedBins.some((bin) => bin.bin === newBin.bin && bin.id !== editingBinId)) {
                setErrorMessage("Este BIN já foi adicionado.");
                return;
            }
            const updatedBins = editedBins.map((bin) =>
                bin.id === editingBinId ? {...bin, bin: newBin.bin ?? '', descricao: newBin.descricao ?? ''} : bin
            );
            setEditedBins(updatedBins);
            setNewBin({bin: "", descricao: ""});
            setEditingBinId(null);
            setShowAddBinFields(false);
        }
    };

    const handleSubmit = () => {
        const updatedBandeira = {...bandeira, bins: editedBins};
        onSaveAction(updatedBandeira);
        onCloseAction();
    };

    const columns: ColumnDef<Bin>[] = [
        {
            accessorKey: "bin",
            header: "BIN",
            meta: {
                buttonFilter: true,
            }
        },
        {
            accessorKey: "descricao",
            header: "Descrição",
        },
        {
            accessorKey: "tipo",
            header: "Tipo",
            cell: (info) => info.getValue() ? info.getValue() === 'D' ? "Débito" : "Crédito" : (bandeira.tipo === 'D' ? "Débito" : "Crédito"),
        },
    ];

    const dataTableProps: IDataTableProps = {
        data: editedBins,
        columns: columns,
        pageCount: 1,
        onPaginationChange: () => {
        },
        onDeleteAction: handleRemoveBin,
        onEditAction: handleEditBin,
        hideFooter: true,
        disableSelect: true,
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {errorMessage && (
                    <MensagemPadrao tipo="erro" mensagem={errorMessage}/>
                )}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Gerenciar BINs - {bandeira.nome}
                    </h2>
                    <BotaoPadrao onClick={onCloseAction} variant="ghost" icon={<X size={24}/>} name="Fechar"/>
                </div>
                <div className="space-y-4">
                    {!showAddBinFields && (
                        <BotaoPadrao
                            onClick={() => setShowAddBinFields(true)}
                            variant="outline"
                            icon={<Plus className="h-5 w-5 mr-2"/>}
                            name="Adicionar BIN"
                        />
                    )}
                    {showAddBinFields && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputPadrao
                                id="bin"
                                label="Novo BIN"
                                type="text"
                                value={newBin.bin}
                                onChange={(e) => setNewBin({...newBin, bin: e.target.value})}
                            />
                            <InputPadrao
                                id="descricao"
                                label="Descrição"
                                type="text"
                                value={newBin.descricao}
                                onChange={(e) => setNewBin({...newBin, descricao: e.target.value})}
                            />
                            {editingBinId === null ? (
                                <BotaoPadrao
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddBinClick();
                                    }}
                                    variant="outline"
                                    name="Adicionar"
                                />
                            ) : (
                                <BotaoPadrao
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleUpdateBin();
                                    }}
                                    variant="outline"
                                    name="Atualizar"
                                />
                            )}
                        </div>
                    )}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            BINs Cadastrados
                        </h3>
                        <DataTablePadrao {...dataTableProps} />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <BotaoPadrao
                            onClick={handleSubmit}
                            variant="outline"
                            name="Salvar Alterações"
                            flex={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}