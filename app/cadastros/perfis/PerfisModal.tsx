"use client"

import {useState, useEffect, useMemo} from "react"
import {Plus, Save, X} from "lucide-react"
import TituloPadrao from "@/components/Titulos/TituloPadrao"
import InputPadrao from "@/components/Inputs/InputPadrao"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao"
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray"
import {IPerfil, IPermissao} from "@/types/perfil"
import {lista as listaPermissao} from "@/services/Permissao";
import {useLoading} from "@/context/LoadingContext";

interface PerfisModalProps {
    isOpen: boolean
    onCloseAction: () => void
    onSaveAction: (perfil: IPerfil) => void
    perfilSelecionado?: IPerfil | undefined
}

export default function PerfisModal({
                                        isOpen,
                                        onCloseAction,
                                        onSaveAction,
                                        perfilSelecionado
                                    }: PerfisModalProps) {
    if (!isOpen) return null
    const {setIsLoading} = useLoading();
    const [newPerfil, setNewPerfil] = useState<IPerfil>({
        id: -1,
        nome: "",
        permissoes: [],
    })
    const isEditingPerfil = perfilSelecionado !== undefined
    const [permissoes, setPermissoes] = useState<IPermissao[]>([]);
    const [permissaoSearch, setPermissaoSearch] = useState<string>('');

    useEffect(() => {
        perfilSelecionado && setNewPerfil(perfilSelecionado)
    }, [perfilSelecionado])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value, id} = e.target
        setNewPerfil((prev) => ({...prev, [id]: value}))
    }

    const handlePermissaoSelect = (permissoesSelecionadas: IPermissao[]) => {
        setNewPerfil((prev) => ({
            ...prev,
            permissoes: permissoesSelecionadas,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSaveAction(newPerfil)
    }

    const fetchPermissoes = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await listaPermissao(filtro);
        setPermissoes(retorno)
        setIsLoading(false);
        return retorno;
    }

    useEffect(() => {
        fetchPermissoes(null);
    }, []);

    useEffect(() => {
        fetchPermissoes(permissaoSearch)
    }, [permissaoSearch]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho="h2" titulo={isEditingPerfil ? "Editar Perfil" : "Adicionar Novo Perfil"}/>
                    <BotaoPadrao onClick={onCloseAction} variant="ghost" icon={<X size={24}/>} name="Fechar"/>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <InputPadrao
                            type="text"
                            id="nome"
                            name="Nome do Perfil"
                            value={newPerfil.nome || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputItensComboboxArray
                            titulo={"Permissões"}
                            data={permissoes}
                            selectedItems={newPerfil.permissoes}
                            campoMostrar={"operacao"}
                            setSelected={handlePermissaoSelect}
                            search={permissaoSearch}
                            setSearch={setPermissaoSearch}
                            width={500}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <BotaoPadrao
                            variant="outline"
                            onClick={handleSubmit}
                            icon={isEditingPerfil ? <Save className="h-5 w-5 mr-2"/> : <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditingPerfil ? "Salvar Alterações" : "Adicionar Perfil"}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}