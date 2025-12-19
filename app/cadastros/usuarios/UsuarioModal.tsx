"use client"

import {useState, useEffect, useCallback} from "react"
import type {Usuario} from "@/types/usuario"
import type {Client as Cliente} from "@/types/client"
import {Plus, Save, X, CheckCircle2, XCircle} from "lucide-react"
import type React from "react"
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import {lista} from "@/services/Cliente";
import {lista as listaPerfil} from "@/services/Perfil";
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";
import {IPerfil} from "@/types/perfil";
import {useLoading} from "@/context/LoadingContext";

interface AddUsuarioModalProps {
    isOpen: boolean
    onCloseAction: () => void
    onSaveAction: (usuario: Usuario) => void
    usuarioSelecionado?: Usuario | undefined;
}

export default function UsuarioModal({
                                         isOpen,
                                         onCloseAction,
                                         onSaveAction,
                                         usuarioSelecionado
                                     }: AddUsuarioModalProps) {
    if (!isOpen) return null;

    const [newUsuario, setNewUsuario] = useState<Usuario>({
        clientes: [],
        email: '',
        id: -1,
        nome: '',
        dataAtualizacao: '',
        usuarioAtualizacao: -1,
        usuarioCriacao: -1,
        senha: '',
        dataCriacao: '',
        isSuporte: false,
        todasAsLojas: false,
        perfis: [],
    });
    const [clients, setClients] = useState<Cliente[]>([])
    const [filteredClients, setFilteredClients] = useState<Cliente[]>([])
    const [filteredPerfil, setFilteredPerfil] = useState<Cliente[]>([])
    const [clientSearch, setClientSearch] = useState("")
    const [perfilSearch, setPerfilSearch] = useState("")
    const isEditingUsuario = usuarioSelecionado !== undefined;
    const [perfis, setPerfis] = useState<IPerfil[]>([]);
    const {setIsLoading} = useLoading();

    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        isTouched: false,
    });

    const isPasswordValid = Object.values(passwordCriteria).every(v => v === true);

    const isButtonDisabled = !isEditingUsuario && !isPasswordValid || newUsuario.senha === undefined || newUsuario.senha === '';


    useEffect(() => {
        if (usuarioSelecionado) {
            setNewUsuario(usuarioSelecionado);
            validatePassword(usuarioSelecionado.senha || '');
            setPasswordCriteria(prev => ({ ...prev, isTouched: false }));
        }
    }, [usuarioSelecionado])

    const fetchClientes = useCallback(async (nome: string | null) => {
        const filtro = {
            "razaoSocial": nome,
        }
        const retorno = await lista(filtro);
        setClients(retorno);
        return retorno;
    }, [])

    useEffect(() => {
        fetchClientes(null);
        fetchPerfis(null);
    }, [])

    useEffect(() => {
        fetchPerfis(perfilSearch.toLowerCase()).then(e => {
            setFilteredPerfil(e);
        })
    }, [perfilSearch])

    useEffect(() => {
        fetchClientes(clientSearch.toLowerCase()).then(e => {
            setFilteredClients(e);
        })
    }, [clientSearch])

    const validatePassword = (password: string) => {
        // A flag 'isTouched' é usada para mostrar os critérios de senha apenas
        // depois que o usuário interage com o campo.
        const touched = passwordCriteria.isTouched;
        setPasswordCriteria({
            isTouched: touched || password !== '',
            length: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewUsuario((prev) => ({...prev, [name.toLowerCase()]: value}));

        if (name.toLowerCase() === 'senha') {
            validatePassword(value);
        }
    }

    const handleSuporteChange = (e: boolean) => {
        setNewUsuario((prev) => ({
            ...prev,
            isSuporte: e,
            todasAsLojas: e,
            clientes: e ? [] : prev.clientes,
        }))
    }

    const handleTodasAsLojasChange = (e: boolean) => {
        setNewUsuario((prev) => ({
            ...prev,
            todasAsLojas: e,
            clientes: e ? [] : prev.clientes
        }))
    }

    const handleClientSelect = (clientesSelecionados: Cliente[]) => {
        setNewUsuario((prev) => ({
            ...prev,
            clientes: clientesSelecionados
        }))
    }

    const handlePerfilSelect = (perfisSelecionados: IPerfil[]) => {
        setNewUsuario((prev) => ({
            ...prev,
            perfis: perfisSelecionados
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isEditingUsuario && !isPasswordValid) {
            return;
        }
        onSaveAction(newUsuario);
    }

    const fetchPerfis = async (filtro: string | null) => {
        setIsLoading(true);
        const retorno = await listaPerfil(filtro);
        setPerfis(retorno)
        setIsLoading(false);
        return retorno;
    }

    const getPasswordCriteriaComponent = (isValid: boolean, text: string) => (
        <li className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
            {isValid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {text}
        </li>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2' titulo={isEditingUsuario ? 'Editar Usuario' : 'Adicionar Novo Usuário'}/>
                    <BotaoPadrao
                        onClick={onCloseAction}
                        variant='ghost'
                        icon={<X size={24}/>}
                        name='Fechar'
                    />
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <InputPadrao
                            type='email'
                            id='email'
                            name='Email'
                            value={newUsuario.email || ""}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type='text'
                            id='nome'
                            name='Nome'
                            value={newUsuario.nome || ""}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="relative">
                        <InputPadrao
                            type='password'
                            id='password'
                            name='Senha'
                            value={newUsuario.senha || ""}
                            onChange={handleInputChange}
                            required={!isEditingUsuario}
                        />
                        {/* Mostra os critérios apenas se o campo foi tocado ou se é uma edição com senha já preenchida */}
                        {(passwordCriteria.isTouched || newUsuario.senha) && (
                            <ul className="text-sm mt-2 space-y-1">
                                {getPasswordCriteriaComponent(passwordCriteria.length, "Mínimo de 8 caracteres")}
                                {getPasswordCriteriaComponent(passwordCriteria.hasUpperCase, "Uma letra maiúscula")}
                                {getPasswordCriteriaComponent(passwordCriteria.hasLowerCase, "Uma letra minúscula")}
                                {getPasswordCriteriaComponent(passwordCriteria.hasNumber, "Um número")}
                                {getPasswordCriteriaComponent(passwordCriteria.hasSpecialChar, "Um caractere especial")}
                            </ul>
                        )}
                    </div>
                    <div className="relative">
                        <CheckBoxPadrao
                            checked={newUsuario.isSuporte}
                            onChange={handleSuporteChange}
                            label={'Suporte'}
                        />
                    </div>
                    <div className="relative">
                        <InputItensComboboxArray
                            titulo={'Perfis'}
                            tituloInput={'Perfis'}
                            data={perfis}
                            selectedItems={newUsuario.perfis}
                            campoMostrar={'nome'}
                            search={perfilSearch}
                            setSearch={setPerfilSearch}
                            setSelected={handlePerfilSelect}
                            width={300}
                        />
                    </div>
                    <div className="relative">
                        <InputItensComboboxArray
                            titulo={'Clientes'}
                            tituloInput={'Cliente'}
                            data={clients}
                            selectedItems={newUsuario.clientes}
                            campoMostrar={'nomeFantasia'}
                            search={clientSearch}
                            setSearch={setClientSearch}
                            setSelected={handleClientSelect}
                            width={300}
                        />
                        {(newUsuario.todasAsLojas || newUsuario.isSuporte) && (
                            <div
                                className="absolute inset-0 z-10 bg-gray-100 opacity-50 cursor-not-allowed rounded-md"></div>
                        )}
                    </div>
                    {!newUsuario.isSuporte && (
                        <div className="relative">
                            <CheckBoxPadrao
                                checked={newUsuario.todasAsLojas}
                                onChange={handleTodasAsLojasChange}
                                label={'Todas as Lojas'}
                            />
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <div className="relative">
                            <BotaoPadrao
                                variant='outline'
                                type='submit'
                                icon={isEditingUsuario ? <Save className="h-5 w-5 mr-2"/> :
                                    <Plus className="h-5 w-5 mr-2"/>}
                                name={isEditingUsuario ? 'Salvar Alterações' : 'Adicionar Usuario'}
                            />
                            {isButtonDisabled && (
                                <div className="absolute inset-0 z-20 bg-gray-100 opacity-50 cursor-not-allowed rounded-md"></div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}