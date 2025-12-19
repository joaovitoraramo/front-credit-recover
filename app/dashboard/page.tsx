"use client";
import React, {useState, useEffect, useCallback, useRef} from "react";
import {useLoading} from "@/context/LoadingContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer, LineChart, Line,
} from "recharts";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {ChevronDown, ChevronUp, MoreHorizontal, RefreshCcw, Search} from "lucide-react";
import FilterDashboardModal from "@/app/dashboard/FilterDashboardModal";
import {ProcessamentoFilter} from "@/types/processamento";
import {useIsMobile} from "@/hooks/use-mobile";
import MobileFilterDashboardModal from "@/app/dashboard/MobileFilterDashboardModal";
import {lista} from "@/services/Relatorio";
import {stringSvgToDataUrl, SvgDisplay} from "@/components/Util/utils";
import Image from "next/image";
import {useCheckPermission} from "@/hooks/useCheckPermission";
import CalendarioDeRecebimentos from "@/app/dashboard/CalendarioDeRecebimentos";

interface Venda {
    modalidade: string;
    tipoAdicional: string;
    valor: number;
    bandeira: string;
}

interface VendaModalidade {
    modalidade: string;
    total: number;
    bandeiras: { nome: string; valor: number }[];
}

export interface Recebimento {
    periodo: string;
    valorTotal: number;
    bandeiras: Bandeira[];
}

interface Encargo {
    descricao: string;
    valor: number;
}

export interface Bandeira {
    nome: string;
    logo: string;
    valor: number;
    taxaMedia: number;
    ticketMedio: number;
    quantidadeVendas: number;
}

interface RecebiveisRecebido {
    data: string;
    recebiveis: number;
    recebido: number;
}

interface TaxaBandeira {
    bandeira: string;
    taxa: number;
}

interface TicketMedio {
    bandeira: string;
    ticketMedio: number;
    quantidadeVendas: number;
}

interface Relatorio {
    vendaTotalDia: number;
    despesaTotalDia: number;
    vendasPorModalidade: Venda[];
    encargos: Encargo[];
    recebiveisRecebidos: RecebiveisRecebido[]
    recebimentoPorData: Recebimento[]
}

export default function Dashboard() {
    useCheckPermission(1001, true);
    const [vendas, setVendas] = useState<Venda[] | undefined>(undefined);
    const [vendasModalidade, setVendasModalidade] = useState<
        VendaModalidade[] | undefined
    >(undefined);
    const [recebimentos, setRecebimentos] = useState<Recebimento[] | null>(null);
    const [encargos, setEncargos] = useState<Encargo[] | undefined>(undefined);
    const [bandeiras, setBandeiras] = useState<Bandeira[] | null>(null);
    const [indexVerBandeiras, setIndexVerBandeiras] = useState(5);
    const divBandeirasRef = useRef<HTMLDivElement>(null);
    const [vendaTotalDia, setVendaTotalDia] = useState<number>(0);
    const [despesaTotalDia, setDespesaTotalDia] = useState<number>(0);
    const [recebiveisRecebido, setRecebiveisRecebido] = useState<
        RecebiveisRecebido[] | undefined
    >(undefined);
    const [taxasBandeira, setTaxasBandeira] = useState<TaxaBandeira[] | undefined>(undefined);
    const [ticketMedio, setTicketMedio] = useState<TicketMedio[] | undefined>(undefined);
    const [atualizarLista, setAtualizarLista] = useState<boolean>(false);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [filter, setFilter] = useState<ProcessamentoFilter>({
        bandeiraIds: [],
        dataDePagamento: true,
    })
    const [initialFilterDone, setInitialFilterDone] = useState(false)
    const isMobile = useIsMobile()
    const [menorData, setMenorData] = useState<Date>();

    const {setIsLoading, isLoading} = useLoading();

    const fetchData = async (filter: ProcessamentoFilter) => {
        if (initialFilterDone) {
            setIsLoading(true);
            const relatorio: Relatorio = await lista({filter});

            if (!relatorio) {
                setIsLoading(false);
                return;
            }

            setVendas(relatorio.vendasPorModalidade);

            const groupedVendas = relatorio.vendasPorModalidade.reduce((acc, venda) => {
                const existingModalidade = acc.find((item) => item.modalidade === venda.modalidade);
                if (existingModalidade) {
                    existingModalidade.total += venda.valor;
                    const existingBandeira = existingModalidade.bandeiras.find((b) => b.nome === venda.bandeira);
                    if (existingBandeira) {
                        existingBandeira.valor += venda.valor;
                    } else {
                        existingModalidade.bandeiras.push({nome: venda.bandeira, valor: venda.valor});
                    }
                } else {
                    acc.push({
                        modalidade: venda.modalidade,
                        total: venda.valor,
                        bandeiras: [{nome: venda.bandeira, valor: venda.valor}]
                    });
                }
                return acc;
            }, [] as VendaModalidade[]);

            setVendasModalidade(groupedVendas);

            let menorDataRest: Date | null = null;

            menorDataRest = new Date(
                Number(relatorio.recebimentoPorData[0].periodo.split('/')[2]),
                parseInt(relatorio.recebimentoPorData[0].periodo.split('/')[1]) - 1,
                Number(relatorio.recebimentoPorData[0].periodo.split('/')[0])
            );

            for (let i = 1; i < relatorio.recebimentoPorData.length; i++) {
                const dataAtual = new Date(
                    Number(relatorio.recebimentoPorData[i].periodo.split('/')[2]), // Ano
                    parseInt(relatorio.recebimentoPorData[i].periodo.split('/')[1]) - 1, // Mês (base 0)
                    Number(relatorio.recebimentoPorData[i].periodo.split('/')[0]) // Dia
                );

                if (dataAtual < menorDataRest) {
                    menorDataRest = dataAtual;
                }
            }
            setMenorData(menorDataRest);
            setRecebimentos(relatorio.recebimentoPorData);
            const bandeirasData: Bandeira[] = [];
            if (relatorio.recebimentoPorData && relatorio.recebimentoPorData.length > 0) {
                const bandeirasDoPrimeiroPeriodo = relatorio.recebimentoPorData[0].bandeiras;

                if (bandeirasDoPrimeiroPeriodo && bandeirasDoPrimeiroPeriodo.length > 0) {
                    for (const bandeira of bandeirasDoPrimeiroPeriodo) {
                        bandeirasData.push({
                            nome: bandeira.nome,
                            logo: bandeira.logo,
                            valor: bandeira.valor,
                            taxaMedia: bandeira.taxaMedia,
                            ticketMedio: bandeira.ticketMedio,
                            quantidadeVendas: bandeira.quantidadeVendas
                        });
                    }
                }
            }

            setBandeiras(bandeirasData);

            setEncargos(relatorio.encargos);

            setVendaTotalDia(relatorio.vendaTotalDia);

            setDespesaTotalDia(relatorio.despesaTotalDia);

            setRecebiveisRecebido(relatorio.recebiveisRecebidos)

            if (bandeirasData && Array.isArray(bandeirasData)) {
                const taxaBandeiras: TaxaBandeira[] = bandeirasData.map(e => {
                    if (e && e.nome && e.taxaMedia) {
                        return {
                            bandeira: e.nome,
                            taxa: e.taxaMedia
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                setTaxasBandeira(taxaBandeiras);
            } else {
                setTaxasBandeira(undefined);
            }

            if (bandeirasData && Array.isArray(bandeirasData)) {
                const ticketMedioData = bandeirasData.map(e => {
                    if (e && e.nome && e.ticketMedio && e.quantidadeVendas) {
                        return {
                            bandeira: e.nome,
                            ticketMedio: e.ticketMedio,
                            quantidadeVendas: e.quantidadeVendas
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                setTicketMedio(ticketMedioData);
            } else {
                setTicketMedio(undefined);
            }

            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filter);
    }, [filter, initialFilterDone, atualizarLista]);

    const coresEncargos = ["#0088FE", "#00C49F", "#FFBB28"];

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-md w-80">
                    <p className="text-lg font-semibold mb-2 text-gray-800">
                        Modalidade: {label}
                    </p>
                    <p className="text-lg font-semibold mb-2 text-gray-800">
                        Total: R$ {payload[0].value.toLocaleString()}
                    </p>
                    <div className="border-t pt-2 mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Bandeiras:</p>
                        <ul className="list-disc list-inside">
                            {data.bandeiras.map((bandeira: any) => (
                                <li key={bandeira.nome} className="text-sm text-gray-600">
                                    <span
                                        className="font-medium">{bandeira.nome}:</span> R$ {bandeira.valor.toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomTooltipTicketMedio = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-md w-80">
                    <p className="text-lg font-semibold mb-2 text-gray-800">
                        {label}
                    </p>
                    <p className="text-sm font-semibold mb-2 text-gray-500">
                        Ticket Médio: R$ {data.ticketMedio.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold mb-2 text-gray-500">
                        Quantidade de vendas: {data.quantidadeVendas.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const handleIndexVerBandeiras = () => {
        if (bandeiras) {
            if (indexVerBandeiras === bandeiras.length) {
                setIndexVerBandeiras(5);
                return;
            }
            setIndexVerBandeiras(bandeiras.length);
            if (divBandeirasRef.current) {
                const offset = divBandeirasRef.current.getBoundingClientRect().top + window.scrollY + 200;
                window.scrollTo({top: offset, behavior: "smooth"});
            }
        }
    };

    const handleFilter = (newFilter: ProcessamentoFilter) => {
        setFilter(newFilter)
        setInitialFilterDone(true)
        setShowFilter(false)
    }

    useEffect(() => {
        if (!initialFilterDone) {
            window.scrollTo(0, 0);
        }
    }, [initialFilterDone]);

    return (
        <div className="min-h-screen bg-gray-100 max-w-full">
            <div className="p-4 md:p-8 ml-0 md:ml-16 transition-all duration-300">
                {/* Botões de Filtro e Atualizar (Sempre Visíveis) */}
                <div className="flex justify-end items-center mb-6">
                    <div className="flex gap-2">
                        {initialFilterDone && (
                            <div>
                                <BotaoPadrao
                                    variant="outline"
                                    onClick={() => setShowFilter(true)}
                                    icon={<Search className="w-4 h-4 font-bold"/>}
                                    name={"Filtrar"}
                                />
                                <BotaoPadrao
                                    variant="outline"
                                    onClick={() => setAtualizarLista(!atualizarLista)}
                                    icon={<RefreshCcw className="w-4 h-4 font-bold"/>}
                                    name={"Atualizar"}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Conteúdo Condicional */}
                {isLoading ? (
                    <>
                        <div className="bg-gray-300 rounded-lg h-10 w-40 mb-4 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div className="bg-gray-300 rounded-lg h-[250px] animate-pulse"></div>
                            <div className="bg-gray-300 rounded-lg h-[250px] animate-pulse"></div>
                        </div>
                        <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-300 rounded-lg h-24 animate-pulse"></div>
                            <div className="bg-gray-300 rounded-lg h-24 animate-pulse"></div>
                            <div className="bg-gray-300 rounded-lg h-24 animate-pulse"></div>
                            <div className="bg-gray-300 rounded-lg h-24 animate-pulse"></div>
                        </div>
                        <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div className="bg-gray-300 rounded-lg h-[300px] animate-pulse"></div>
                            <div className="bg-gray-300 rounded-lg h-[300px] animate-pulse"></div>
                        </div>
                    </>
                ) : !initialFilterDone ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex flex-col items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-24 w-24 text-gray-400 mb-4 animate-bounce"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00.293.707l7 7a1 1 0 001.414-1.414l-7-7A1 1 0 0019 6.586V4a1 1 0 01-1-1H4a1 1 0 01-1 1v16a1 1 0 011 1h16a1 1 0 011-1v-3.414a1 1 0 00-.293-.707l-7-7a1 1 0 00-1.414 1.414l7 7A1 1 0 0020 16.586V20a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                                />
                            </svg>
                            <p className="text-lg text-gray-600 mb-4">
                                Filtre para exibir os dados desejados.
                            </p>
                            <BotaoPadrao
                                variant="outline"
                                onClick={() => setShowFilter(true)}
                                icon={<Search className="w-4 h-4 font-bold"/>}
                                name={"Filtrar"}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Conteúdo Principal */}
                        <div className="mt-8 bg-white p-4 rounded-lg shadow-md hover:shadow-primary duration-300">
                            <div className="flex flex-wrap justify-between">
                                <div
                                    className="w-full md:w-1/2 mb-4 md:mb-0">
                                    <h3 className="text-lg font-semibold mb-2 text-gray-700">
                                        Venda Total do Período
                                    </h3>
                                    <p className="text-3xl font-bold text-primary">
                                        {vendaTotalDia.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })}
                                    </p>
                                </div>
                                <div className="w-full md:w-1/2">
                                    <h3 className="text-lg font-semibold mb-2 text-gray-700">
                                        Despesas do Período
                                    </h3>
                                    <p className="text-3xl font-bold text-primary">
                                        {despesaTotalDia.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Barras: Vendas por Modalidade */}
                        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Vendas por
                                Modalidade</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={vendasModalidade} barCategoryGap="10%">
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}
                                                   stroke="#e0e0e0"/>
                                    <XAxis dataKey="modalidade" tick={{fontSize: 12}}
                                           stroke="#757575"/>
                                    <YAxis tick={{fontSize: 12}} stroke="#757575"/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Bar dataKey="total" name="Total" fill="#6366f1" barSize={30}
                                         radius={[8, 8, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div>
                            <h3 className="mt-8 text-lg font-semibold mb-4 text-gray-800">Previsões de Recebimentos Líquidos</h3>
                            <CalendarioDeRecebimentos dataInicial={menorData} recebimentos={recebimentos} />
                        </div>

                        {/*/!* Calendário de Previsões de Recebimentos Líquidos *!/*/}
                        {/*<div className="mt-8 bg-white p-6 rounded-lg shadow-md">*/}
                        {/*    <h3 className="text-lg font-semibold mb-4 text-gray-800">Previsões de Recebimentos*/}
                        {/*        Líquidos</h3>*/}
                        {/*    {recebimentos?.map((recebimento) => (*/}
                        {/*        <div key={recebimento.periodo}*/}
                        {/*             className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg hover:shadow-primary transition-shadow duration-300">*/}
                        {/*            <div*/}
                        {/*                className="flex justify-between items-center cursor-pointer"*/}
                        {/*                onClick={() => setExpandedRow(expandedRow === recebimento.periodo ? null : recebimento.periodo)}*/}
                        {/*            >*/}
                        {/*                <div>*/}
                        {/*                    <p className="font-semibold">{recebimento.periodo}</p>*/}
                        {/*                    <p className="text-gray-600">R$ {recebimento.valorTotal.toLocaleString()}</p>*/}
                        {/*                </div>*/}
                        {/*                {expandedRow === recebimento.periodo ? (*/}
                        {/*                    <ChevronUp className="w-5 h-5"/>*/}
                        {/*                ) : (*/}
                        {/*                    <ChevronDown className="w-5 h-5"/>*/}
                        {/*                )}*/}
                        {/*            </div>*/}
                        {/*            {expandedRow === recebimento.periodo && (*/}
                        {/*                <div*/}
                        {/*                    className="mt-4 space-y-4"> /!* Adicionado space-y-4 para espaçamento vertical *!/*/}
                        {/*                    {recebimento.bandeiras?.map((bandeira) => (*/}
                        {/*                        <div key={bandeira.nome}*/}
                        {/*                             className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-200 pt-4"> /!* Flex-col para mobile, flex-row para desktop *!/*/}
                        {/*                            <div*/}
                        {/*                                className="flex items-center mb-2 sm:mb-0"> /!* Adicionado mb-2 para espaçamento no mobile *!/*/}
                        {/*                                <Image*/}
                        {/*                                    src={stringSvgToDataUrl(bandeira.logo)}*/}
                        {/*                                    alt={bandeira.nome}*/}
                        {/*                                    width={48} // Reduzido o tamanho da imagem para melhor ajuste no mobile*/}
                        {/*                                    height={48}*/}
                        {/*                                    style={{marginRight: 12}} // Aumentado o espaçamento à direita*/}
                        {/*                                />*/}
                        {/*                                <p className="text-gray-700 text-sm sm:text-base">{bandeira.nome}</p> /!* Ajustado o tamanho da fonte *!/*/}
                        {/*                            </div>*/}
                        {/*                            <p className="text-gray-700 text-base font-semibold">R$ {bandeira.valor.toLocaleString()}</p> /!* Adicionado font-semibold para destacar o valor *!/*/}
                        {/*                        </div>*/}
                        {/*                    ))}*/}
                        {/*                </div>*/}
                        {/*            )}*/}
                        {/*        </div>*/}
                        {/*    ))}*/}
                        {/*</div>*/}

                        {/* Gráfico de Recebíveis x Recebido */}
                        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recebíveis x
                                Recebido</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={recebiveisRecebido}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                    <XAxis dataKey="data" stroke="#757575"/>
                                    <YAxis stroke="#757575"/>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#f9f9f9",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                        labelStyle={{
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}
                                        itemStyle={{color: "#666"}}
                                    />
                                    <Legend wrapperStyle={{paddingBottom: "10px"}}/>
                                    <Line type="monotone" dataKey="recebiveis" name="Recebíveis" stroke="#6366f1"
                                          strokeWidth={2} dot={{r: 4}}/>
                                    <Line type="monotone" dataKey="recebido" name="Recebido" stroke="#10b981"
                                          strokeWidth={2}
                                          dot={{r: 4}}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Gráfico de Taxas por Bandeira */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Taxa média do período por
                                    bandeira</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={taxasBandeira}>
                                        <CartesianGrid strokeDasharray="3 3"
                                                       stroke="#e0e0e0"/>
                                        <XAxis dataKey="bandeira" stroke="#757575"/>
                                        <YAxis stroke="#757575"
                                               tickFormatter={(value) => `${value}%`}/>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#f9f9f9",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px"
                                            }}
                                            labelStyle={{
                                                fontWeight: "bold",
                                                color: "#333"
                                            }}
                                            itemStyle={{color: "#666"}}
                                        />
                                        <Bar dataKey="taxa" name="Taxa (%)" fill="#f59e0b" barSize={30}
                                             radius={[8, 8, 0, 0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Gráfico de Ticket Médio por Bandeira */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Ticket Médio por Bandeira</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ticketMedio}>
                                        <CartesianGrid strokeDasharray="3 3"
                                                       stroke="#e0e0e0"/>
                                        <XAxis dataKey="bandeira" stroke="#757575"/>
                                        <YAxis stroke="#757575"/>
                                        <Tooltip content={<CustomTooltipTicketMedio/>}/>
                                        <Bar dataKey="ticketMedio" name="Ticket Médio" fill="#dc2626" barSize={30}
                                             radius={[8, 8, 0, 0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico de Pizza: Total de Encargos */}
                        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Despesas (Aplicadas)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={encargos}
                                        dataKey="valor"
                                        nameKey="descricao"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label={{fill: "#333"}}
                                    >
                                        {encargos?.map((entry, index) => (
                                            <Cell key={`cell-${index}`}
                                                  fill={coresEncargos[index % coresEncargos.length]}/>
                                        ))}
                                    </Pie>
                                    <Legend wrapperStyle={{paddingBottom: "10px"}}/>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#f9f9f9",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                        labelStyle={{
                                            fontWeight: "bold",
                                            color: "#333"
                                        }}
                                        itemStyle={{color: "#666"}}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Ranking de Bandeiras de Vendas */}
                        <div className="mt-8" ref={divBandeirasRef}>
                            <div className="mb-2 flex justify-between items-center">
                                <h3 className="text-lg font-semibold mb-4">Vendas por bandeira</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {bandeiras
                                    ?.slice()
                                    .sort((a, b) => b.valor - a.valor)
                                    .slice(0, indexVerBandeiras)
                                    .map((bandeira) => (
                                        <div
                                            key={bandeira.nome}
                                            className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center hover:shadow-lg hover:shadow-primary transition-shadow duration-300"
                                        >
                                            <Image
                                                src={stringSvgToDataUrl(bandeira.logo)}
                                                alt={bandeira.nome}
                                                width={80}
                                                height={80}
                                                style={{
                                                    marginBottom: 8
                                                }}
                                            />
                                            <p className="text-sm font-semibold text-gray-800">{bandeira.nome}</p>
                                            <p className="text-sm text-gray-600">R$ {bandeira.valor.toLocaleString()}</p>
                                        </div>
                                    ))}
                            </div>
                            <div className="mt-4">
                                {bandeiras && bandeiras.length > 5 && (
                                    <BotaoPadrao
                                        variant="ghost"
                                        name={indexVerBandeiras === 5 ? "Mostrar mais" : "Mostrar menos"}
                                        icon={<MoreHorizontal className="w-5 h-5"/>}
                                        onClick={handleIndexVerBandeiras}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {!isMobile ? (
                <FilterDashboardModal
                    open={showFilter}
                    onOpenChange={() => setShowFilter(false)}
                    initialFilter={filter}
                    onFilter={handleFilter}
                    onCancelAction={() => setShowFilter(false)}
                    initialFilterDone={initialFilterDone}
                />
            ) : (
                <MobileFilterDashboardModal
                    open={showFilter}
                    onOpenChange={() => setShowFilter(false)}
                    initialFilter={filter}
                    onFilter={handleFilter}
                    onCancelAction={() => setShowFilter(false)}
                    initialFilterDone={initialFilterDone}
                />
            )}

        </div>
    );
}