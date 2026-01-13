"use client"
import {useCallback, useEffect, useState} from "react"
import {Client, STATUS_CLIENTE_LABEL, StatusCliente} from "@/types/client"
import type {Contabilidade} from "@/types/contabilidade"
import type {BandeirasCliente} from "@/types/bandeirasCliente"
import {CreditCard, Globe, Info, Plus, Save, Wrench, X} from "lucide-react"
import ClienteBandeirasTab from "./ClienteBandeirasTab"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import TituloPadrao from "@/components/Titulos/TituloPadrao";
import InputPadrao from "@/components/Inputs/InputPadrao";
import {lista as listaContabilidade} from "@/services/Contabilidade";
import InputItensCombobox from "@/components/Inputs/InputItensCombo";
import ClienteAdicionaisTab from "@/app/cadastros/clientes/ClienteAdicionaisTab";

interface AddClientModalProps {
    isOpen: boolean
    onCloseAction: () => void
    onSaveAction: (client: Client) => void
    clienteSelecionado?: Client;
}

export default function ClienteModal({
                                         isOpen,
                                         onCloseAction,
                                         onSaveAction,
                                         clienteSelecionado
                                     }: AddClientModalProps) {
    if (!isOpen) return null

    const [newClient, setNewClient] = useState<Partial<Client>>({
        bandeirasCliente: [],
        cnpj: "",
        nomeFantasia: "",
        razaoSocial: "",
        endereco: "",
        cep: "",
        telefone: "",
        celular: "",
        email: "",
        emailSecundario: "",
        pdvs: 0,
        pos: 0,
        regimeTributario: "",
        erp: "",
        tef: "",
        loginSitef: "",
        senhaSitef: "",
        linkSitef: "",
        contabilidade: undefined,
        status: "ATIVO",
    })
    const [contabilidades, setContabilidades] = useState<Contabilidade[]>([])
    const [filteredContabilidades, setFilteredContabilidades] = useState<Contabilidade[]>([])
    const [contabilidadeSearch, setContabilidadeSearch] = useState("")
    const [activeTab, setActiveTab] = useState("info")
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [isFormValid, setIsFormValid] = useState(false)
    const isEditingCliente: boolean = clienteSelecionado !== undefined;

    useEffect(() => {
        clienteSelecionado && setNewClient(clienteSelecionado);
        if (clienteSelecionado && clienteSelecionado.contabilidade) {
            if (clienteSelecionado.contabilidade && clienteSelecionado.contabilidade.razaoSocial) {
                setContabilidadeSearch(clienteSelecionado.contabilidade.razaoSocial)
            }
        }
    }, [clienteSelecionado])

    const validateForm = useCallback(() => {
        const requiredFields = [
            "cnpj",
            "nomeFantasia",
            "razaoSocial",
            "endereco",
            "cep",
            "telefone",
            "celular",
            "email",
            "pdvs",
            "pos",
            "regimeTributario",
            "erp",
            "tef",
            "loginSitef",
            "senhaSitef",
            "contabilidade",
        ]

        const newErrors: { [key: string]: string } = {}
        requiredFields.forEach((field) => {
            if (!newClient[field as keyof Client]) {
                newErrors[field] = "Este campo é obrigatório"
            }
        })

        return {
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
        }
    }, [newClient])

    const fetchContabilidade = useCallback(async (nome: string | null) => {
        const filtro = {
            "nomeFantasia": nome,
        }
        const retorno = await listaContabilidade(filtro);
        setContabilidades(retorno);
        return retorno;
    }, [])

    useEffect(() => {
        fetchContabilidade(null);
    }, [])

    useEffect(() => {
        fetchContabilidade(contabilidadeSearch.toLowerCase()).then(e => {
            setContabilidades(e);
        })
    }, [contabilidadeSearch])

    useEffect(() => {
        const {errors, isValid} = validateForm()
        setErrors(errors)
        setIsFormValid(isValid)
    }, [validateForm])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setNewClient((prev) => ({...prev, [name]: value}))
        validateField(name, value)
    }

    const handleContabilidadeSelect = (contabilidade: Contabilidade) => {
        setNewClient((prev) => ({...prev, contabilidade}))
        if (contabilidade.nomeFantasia) {
            setContabilidadeSearch(contabilidade.nomeFantasia)
        }
        validateField("contabilidade", contabilidade)
    }

    const validateField = (name: string, value: any) => {
        let error = ""
        if (value === "" || value === undefined) {
            error = "Este campo é obrigatório"
        }
        setErrors((prev) => ({...prev, [name]: error}))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const {isValid} = validateForm()
        console.log(newClient)
        if (isValid) {
            onSaveAction(newClient as Client)
        } else {
            const {errors} = validateForm()
            setErrors(errors)
        }
    }

    const handleAddBandeiraCliente = (newBandeiraCliente: Omit<BandeirasCliente, "id" | "cliente">) => {
        setNewClient((prev) => ({
            ...prev,
            bandeirasCliente: [
                ...(prev.bandeirasCliente || []),
                {...newBandeiraCliente, id: null},
            ],
        }))
    }

    const handleEditBandeiraCliente = (editedBandeiraCliente: BandeirasCliente) => {
        setNewClient((prev) => ({
            ...prev,
            bandeirasCliente: prev.bandeirasCliente?.map((bc) =>
                bc.id === editedBandeiraCliente.id ? editedBandeiraCliente : bc,
            ),
        }))
    }

    const handleDeleteBandeiraCliente = (bandeiraClienteId?: number | null) => {
        setNewClient((prev) => {
            const updatedBandeiras = prev.bandeirasCliente?.map((bc) => {
                if (bc.id === bandeiraClienteId) {
                    const novoValorDeleta = bc.deleta === undefined ? true : !bc.deleta;
                    return { ...bc, deleta: novoValorDeleta };
                }
                return bc;
            }) || [];

            return {
                ...prev,
                bandeirasCliente: updatedBandeiras,
            };
        });
    };

    const handleUndoDeleteBandeiraCliente = (bandeiraClienteId?: number | null) => {
        setNewClient((prev) => {
            const updatedBandeiras = prev.bandeirasCliente?.map((bc) => {
                if (bc.id === bandeiraClienteId) {
                    return {...bc, deleta: false};
                }
                return bc;
            }) || [];

            return {
                ...prev,
                bandeirasCliente: updatedBandeiras,
            };
        });
    };

    const STATUS_OPTIONS = Object.entries(STATUS_CLIENTE_LABEL).map(
        ([value, label]) => ({
            value: value as StatusCliente,
            label,
        })
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <TituloPadrao tamanho='h2' titulo={isEditingCliente ? 'Editar Cliente' : 'Adicionar Novo Cliente'}/>
                    <BotaoPadrao
                        variant='ghost'
                        onClick={onCloseAction}
                        name='Fechar'
                        icon={<X size={24}/>}
                    />
                </div>
                <div className="mb-8">
                    <BotaoPadrao
                        name="Informações"
                        variant={activeTab === "info" ? "outline" : "ghost"}
                        onClick={() => setActiveTab("info")}
                        icon={<Info className="h-4 w-4"/>}
                    />
                    <BotaoPadrao
                        name="Bandeiras"
                        variant={activeTab === "bandeiras" ? "outline" : "ghost"}
                        onClick={() => setActiveTab("bandeiras")}
                        icon={<CreditCard className="h-4 w-4"/>}
                        disabled={!isFormValid}
                    />
                    <BotaoPadrao
                        name="Adicionais"
                        variant={activeTab === "adicionais" ? "outline" : "ghost"}
                        onClick={() => setActiveTab("adicionais")}
                        icon={<Globe className="h-4 w-4"/>}
                        disabled={!isFormValid}
                    />
                </div>
                <div>
                    {activeTab === "info" && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                {name: "cnpj", label: "CNPJ"},
                                {name: "nomeFantasia", label: "Nome Fantasia"},
                                {name: "razaoSocial", label: "Razão Social"},
                                {name: "endereco", label: "Endereço"},
                                {name: "cep", label: "CEP"},
                                {name: "telefone", label: "Telefone"},
                                {name: "celular", label: "Celular"},
                                {name: "email", label: "Email"},
                                {name: "emailSecundario", label: "Email Secundário"},
                                {name: "pdvs", label: "PDVs", type: "number"},
                                {name: "pos", label: "POS", type: "number"},
                                {name: "regimeTributario", label: "Regime Tributário"},
                                {name: "erp", label: "ERP"},
                                {name: "tef", label: "TEF"},
                                {name: "loginSitef", label: "Login SITEF"},
                                {name: "senhaSitef", label: "Senha SITEF", type: "password"},
                                {name: "linkSitef", label: "Link SITEF"},
                            ].map((field) => (
                                <div key={field.name} className="relative">
                                    <InputPadrao
                                        type={field.type || "text"}
                                        id={field.name}
                                        name={field.name}
                                        // @ts-ignore
                                        value={newClient[field.name as keyof Client] || ""}
                                        onChange={handleInputChange}
                                        required
                                        label={field.label}
                                    />
                                    {errors[field.name] &&
                                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                                </div>
                            ))}
                            <div className="col-span-4">
                                <InputItensCombobox
                                    titulo={'Contabilidade'}
                                    data={contabilidades}
                                    search={contabilidadeSearch}
                                    setSearch={setContabilidadeSearch}
                                    setSelected={handleContabilidadeSelect}
                                    selectedItem={newClient.contabilidade}
                                    campoMostrar={'nomeFantasia'}
                                    width={600}
                                />
                                {errors.contabilidade &&
                                    <p className="text-red-500 text-xs mt-1">{errors.contabilidade}</p>}
                            </div>
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status do cliente
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {Object.entries(STATUS_CLIENTE_LABEL).map(([value, label]) => {
                                        const status = value as StatusCliente;
                                        const selected = newClient.status === status;

                                        return (
                                            <div
                                                key={status}
                                                onClick={() =>
                                                    setNewClient((prev) => ({
                                                        ...prev,
                                                        status,
                                                    }))
                                                }
                                                className={`
                        cursor-pointer rounded-xl border p-4
                        transition-all duration-200
                        flex items-center gap-3
                        ${selected
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-gray-200 hover:shadow-md hover:-translate-y-[1px]"}
                    `}
                                            >
                                                <div
                                                    className={`
                            h-10 w-10 rounded-lg flex items-center justify-center
                            ${selected
                                                        ? "bg-primary text-white"
                                                        : "bg-gray-100 text-gray-500"}
                        `}
                                                >
                                                    {/** ícone opcional */}
                                                    {status === "ATIVO" && <Info className="h-5 w-5" />}
                                                    {status === "INATIVO" && <Globe className="h-5 w-5" />}
                                                    {status === "IMPLANTACAO" && <Wrench className="h-5 w-5" />}
                                                    {status === "CANCELADO" && <X className="h-5 w-5" />}
                                                </div>

                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold">{label}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {status === "ATIVO" && "Cliente ativo e operando normalmente"}
                                                        {status === "INATIVO" && "Cliente inativo no sistema"}
                                                        {status === "IMPLANTACAO" && "Cliente sendo implantado na plataforma"}
                                                        {status === "CANCELADO" && "Cliente desativado na plataforma"}
                                                    </p>
                                                </div>

                                                <input
                                                    type="radio"
                                                    checked={selected}
                                                    onChange={() => {}}
                                                    className="accent-primary"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "bandeiras" && (
                        <ClienteBandeirasTab
                            bandeirasClienteProp={newClient.bandeirasCliente || []}
                            onAddAction={handleAddBandeiraCliente}
                            onEditAction={handleEditBandeiraCliente}
                            onDeleteAction={handleDeleteBandeiraCliente}
                            onUndoDeleteAction={handleUndoDeleteBandeiraCliente}
                        />
                    )}
                    {activeTab === 'adicionais' && ( // <-- Renderize a nova aba
                        <ClienteAdicionaisTab
                            client={newClient}
                            onClientChange={setNewClient} // Passa o setter para atualizar o estado pai
                        />
                    )}
                    <div className="col-span-4 mt-4 flex justify-end">
                        <BotaoPadrao
                            variant='outline'
                            onClick={handleSubmit}
                            icon={isEditingCliente ? <Save className="h-5 w-5 mr-2"/> :
                                <Plus className="h-5 w-5 mr-2"/>}
                            name={isEditingCliente ? 'Salvar Alterações' : 'Adicionar Cliente'}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

