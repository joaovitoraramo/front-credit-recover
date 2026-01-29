"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {motion} from "framer-motion";
import {lista} from "@/services/Cliente";
import {listaPorClienteTipo} from "@/services/Bandeira";
import type {Client} from "@/types/client";
import type {Bandeira} from "@/types/bandeira";
import {Input} from '@/components/ui/input';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import InputItensCombobox from "@/components/Inputs/InputItensCombo";
import InputItensComboboxArray from "@/components/Inputs/InputItensComboArray";
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import Image from "next/image";
import {
    Periodo,
    RankingBandeira,
    ResumoComparativo,
    ResumoVendas,
    TicketMedioBandeira,
    VendasPorModalidade
} from "@/types/dashboard";
import {
    fetchRankingBandeiras,
    fetchResumo,
    fetchTicketMedio,
    fetchVendasPorModalidade
} from "@/services/Dashboard/dashboard";
import {SlidersHorizontal} from "lucide-react";

/* =========================
   AUX
========================= */

function calcularComparativo(atual: number): ResumoComparativo {
    const anterior = atual * (0.85 + Math.random() * 0.2);
    return {atual, anterior};
}

function percentualDiff(atual: number, anterior: number) {
    return ((atual - anterior) / anterior) * 100;
}

/* =========================
   PAGE
========================= */

export default function DashboardVendasPage() {
    /* ---------- MODAL ---------- */
    const [modalOpen, setModalOpen] = useState(false);
    const [tooltipData, setTooltipData] = useState<any>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const painelModalidadesRef = useRef<HTMLDivElement>(null);
    const [isTooltipHovered, setIsTooltipHovered] = useState(false);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);
    const activeKeyRef = useRef<string | null>(null);

    /* ---------- FILTRO GLOBAL (BASE) ---------- */
    const [periodoGlobal, setPeriodoGlobal] = useState<Periodo>({
        inicio: "",
        fim: "",
    });

    const [clienteSearch, setClienteSearch] = useState("");
    const [bandeiraSearch, setBandeiraSearch] = useState("");

    const [clientes, setClientes] = useState<Client[]>([]);
    const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);

    const [selectedCliente, setSelectedCliente] = useState<Client | null>(null);
    const [selectedBandeiras, setSelectedBandeiras] = useState<Bandeira[]>([]);

    const clienteInputRef = useRef<HTMLButtonElement>(null);

    /* ---------- FILTROS POR CARD ---------- */
    const [periodoRanking, setPeriodoRanking] = useState<Periodo>({
        inicio: "",
        fim: "",
    });

    const [periodoTicketMedio, setPeriodoTicketMedio] = useState<Periodo>({
        inicio: "",
        fim: "",
    });

    const [resumo, setResumo] = useState<ResumoVendas | null>(null);
    const [loadingResumo, setLoadingResumo] = useState(false);

    const [modalidades, setModalidades] = useState<VendasPorModalidade[]>([]);
    const [loadingModalidades, setLoadingModalidades] = useState(false);

    const [ranking, setRanking] = useState<RankingBandeira[]>([]);
    const [loadingRanking, setLoadingRanking] = useState(false);

    const [ticketMedio, setTicketMedio] = useState<TicketMedioBandeira[]>([]);
    const [loadingTicketMedio, setLoadingTicketMedio] = useState(false);

    /* ---------- FETCH ---------- */

    const fetchClientes = useCallback(async (nome: string | null) => {
        const filtro = {razaoSocial: nome};
        const retorno = await lista(filtro);
        setClientes(retorno);
        return retorno;
    }, []);

    const fetchBandeiras = useCallback(
        async (filtro: any | null) => {
            if (!selectedCliente) return;
            const retorno = await listaPorClienteTipo(filtro, selectedCliente.id);
            setBandeiras(retorno);
            return retorno;
        },
        [selectedCliente]
    );

    useEffect(() => {
        fetchClientes(clienteSearch);
    }, [clienteSearch]);

    useEffect(() => {
        fetchBandeiras(bandeiraSearch);
    }, [bandeiraSearch, selectedCliente]);

    const carregarResumo = async (params: any) => {
        setLoadingResumo(true);
        try {
            const res = await fetchResumo(params);
            setResumo(res);
        } finally {
            setLoadingResumo(false);
        }
    };

    const carregarModalidades = async (params: any) => {
        setLoadingModalidades(true);
        try {
            const res = await fetchVendasPorModalidade(params);
            setModalidades(res);
        } finally {
            setLoadingModalidades(false);
        }
    };

    const carregarRanking = async (params: any) => {
        setLoadingRanking(true);
        try {
            const res = await fetchRankingBandeiras(params);
            setRanking(res);
        } finally {
            setLoadingRanking(false);
        }
    };

    const carregarTicketMedio = async (params: any) => {
        setLoadingTicketMedio(true);
        try {
            const res = await fetchTicketMedio(params);
            setTicketMedio(res);
        } finally {
            setLoadingTicketMedio(false);
        }
    };


    const aplicarFiltroGlobal = () => {
        const params = {
            dataInicial: periodoGlobal.inicio,
            dataFinal: periodoGlobal.fim,
            clienteId: selectedCliente?.id,
            bandeiraIds: selectedBandeiras.map(b => b.id),
        };

        carregarResumo(params);
        carregarModalidades(params);
        carregarRanking(params);
        carregarTicketMedio(params);
    };

    useEffect(() => {
        if (!periodoRanking.inicio || !periodoRanking.fim) return;

        carregarRanking({
            periodo: periodoRanking,
            clienteId: selectedCliente?.id,
        });
    }, [periodoRanking]);

    useEffect(() => {
        if (!periodoTicketMedio.inicio || !periodoTicketMedio.fim) return;

        carregarTicketMedio({
            periodo: periodoTicketMedio,
            clienteId: selectedCliente?.id,
        });
    }, [periodoTicketMedio]);

    /* ---------- DERIVAÇÕES ---------- */

    const rankingFiltrado = useMemo(() => {
        if (!selectedBandeiras.length) return ranking;
        return ranking.filter((b) =>
            selectedBandeiras.some((sb) => sb.nome === b.bandeira)
        );
    }, [selectedBandeiras, ranking]);

    const ticketComparativo = calcularComparativo(
        ticketMedio.reduce((acc, i) => acc + i.ticketMedio, 0)
    );

    /* ========================= */

    function EmptyStateFiltro({ onOpenFiltro }: { onOpenFiltro: () => void }) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="relative flex items-center justify-center min-h-[75vh] overflow-hidden"
            >
                {/* Glow de fundo radial */}
                <div
                    aria-hidden
                    className="
                    absolute inset-0
                    bg-[radial-gradient(circle_at_50%_45%,theme(colors.primary/15),transparent_65%)]
                "
                />

                {/* Glow animado sutil flutuante */}
                <motion.div
                    aria-hidden
                    animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.95, 1, 0.95] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="
                    absolute h-[420px] w-[420px] rounded-full
                    bg-primary/20 blur-3xl
                "
                />

                {/* Card */}
                <motion.div
                    initial={{ y: 28, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 16 }}
                    className="
                    relative z-10
                    w-full max-w-xl
                    rounded-[28px]
                    bg-white
                    p-12
                    shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)]
                "
                >
                    {/* Ícone central flutuante */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex justify-center mb-8"
                    >
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10"
                        >
                            {/* Glow interno */}
                            <div
                                aria-hidden
                                className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"
                            />

                            {/* Ícone central */}
                            <SlidersHorizontal
                                size={28}
                                className="text-primary flex-shrink-0 relative z-10"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Texto */}
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Nenhum dado disponível
                        </h2>

                        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
                            Aplique um filtro inicial para carregar métricas, gráficos
                            e comparativos de vendas.
                        </p>
                    </div>

                    {/* Botão CTA centralizado */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="flex justify-center mt-10"
                    >
                        <motion.button
                            whileHover={{
                                y: -2,
                                boxShadow: "0 15px 30px -12px rgba(99,102,241,0.6)",
                            }}
                            whileTap={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 18 }}
                            onClick={onOpenFiltro}
                            className="
                            relative inline-flex items-center gap-2
                            px-8 py-4 rounded-xl
                            bg-primary text-white
                            font-medium
                            shadow-lg shadow-primary/40
                        "
                        >
                            <SlidersHorizontal size={18} className="flex-shrink-0" />
                            Aplicar filtros
                        </motion.button>
                    </motion.div>

                    {/* Linha inferior neon animada */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.35, duration: 0.45 }}
                        className="
        absolute bottom-0
        h-[3px] w-2/3
        rounded-full
        bg-gradient-to-r from-transparent via-primary to-transparent
        mx-auto
        left-0 right-0
        origin-center
    "
                    />
                </motion.div>
            </motion.div>
        );
    }



    return (
        <>
            {/* ================= MODAL GLOBAL ================= */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                    opacity: modalOpen ? 1 : 0,
                    pointerEvents: modalOpen ? "auto" : "none",
                }}
            >
                {/* BACKDROP */}
                <motion.div
                    animate={{
                        opacity: modalOpen ? 1 : 0,
                        backdropFilter: modalOpen ? "blur(6px)" : "blur(0px)",
                    }}
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setModalOpen(false)}
                />

                {/* MODAL */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: modalOpen ? 1 : 0,
                        y: modalOpen ? 0 : 20,
                        scale: modalOpen ? 1 : 0.97,
                    }}
                    transition={{duration: 0.25}}
                    className="relative bg-white rounded-2xl shadow-xl w-full max-w-[520px] p-6 z-10"
                >
                    <h2 className="text-xl font-semibold mb-4">
                        Filtros Globais
                    </h2>

                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="date"
                                value={periodoGlobal.inicio}
                                onChange={(e) =>
                                    setPeriodoGlobal({...periodoGlobal, inicio: e.target.value})
                                }
                            />
                            <Input
                                type="date"
                                value={periodoGlobal.fim}
                                onChange={(e) =>
                                    setPeriodoGlobal({...periodoGlobal, fim: e.target.value})
                                }
                            />
                        </div>

                        <InputItensCombobox
                            titulo={"Cliente"}
                            data={clientes}
                            search={clienteSearch}
                            setSearch={setClienteSearch}
                            setSelected={setSelectedCliente}
                            selectedItem={selectedCliente}
                            campoMostrar={"nomeFantasia"}
                            ref={clienteInputRef}
                            width={376}
                        />

                        <InputItensComboboxArray
                            titulo={"Bandeiras"}
                            data={bandeiras}
                            search={bandeiraSearch}
                            setSearch={setBandeiraSearch}
                            setSelected={setSelectedBandeiras}
                            selectedItems={selectedBandeiras}
                            campoMostrar={"nome"}
                            width={376}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <BotaoPadrao
                            variant="outline"
                            name="Cancelar"
                            onClick={() => setModalOpen(false)}
                        />
                        <BotaoPadrao
                            variant="outline"
                            name="Aplicar"
                            onClick={() => {
                                aplicarFiltroGlobal();
                                setModalOpen(false);
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* ================= PAGE ================= */}
            <div
                className="
    min-h-screen bg-gray-100 py-10
    pl-[64px]
  "
            >

                {!resumo && !loadingResumo ? (
                    <div className="max-w-[1600px] mx-auto px-6 space-y-10">
                        <EmptyStateFiltro onOpenFiltro={() => setModalOpen(true)} />
                    </div>
                    ) : (
                    <div className="max-w-[1600px] mx-auto px-6 space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold">Dashboard de Vendas</h1>
                            </div>

                            <BotaoPadrao
                                variant="outline"
                                name="Filtros"
                                onClick={() => setModalOpen(true)}
                            />
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {resumo && (
                                <>
                                    <KPIComparativo label="Vendas Brutas" value={resumo.valorBruto}/>
                                    <KPIComparativo label="Valor Líquido" value={resumo.valorLiquido}/>
                                    <KPIComparativo label="Despesas" value={resumo.despesas}/>
                                    <KPIComparativo
                                        label="Taxa Média"
                                        value={resumo.taxaMedia}
                                        isPercent
                                    />
                                </>
                            )}
                        </div>

                        {/* GRID */}
                        <div className="grid grid-cols-12 gap-8">
                            <Painel className="col-span-12 lg:col-span-8 relative">
                                <PainelHeader title="Vendas por Modalidade" />

                                <ResponsiveContainer height={320}>
                                    <BarChart
                                        data={modalidades}
                                        onMouseMove={(e: any) => {
                                            if (!e?.activePayload?.length) return;

                                            if (hideTimeout.current) {
                                                clearTimeout(hideTimeout.current);
                                                hideTimeout.current = null;
                                            }

                                            setTooltipData(e.activePayload[0].payload);
                                            setTooltipPosition({
                                                x: e.chartX,
                                                y: e.chartY
                                            });
                                        }}
                                        onMouseLeave={() => {
                                            hideTimeout.current = setTimeout(() => {
                                                if (!isTooltipHovered) {
                                                    setTooltipData(null);
                                                }
                                            }, 120);
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="modalidade" />
                                        <YAxis />

                                        {/* Tooltip invisível só para ativar activePayload */}
                                        <Tooltip content={() => null} cursor={{ fill: "transparent" }} />

                                        <Bar
                                            dataKey="total"
                                            fill="#6366f1"
                                            radius={[10, 10, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>

                                {/* 🔥 TOOLTIP EXTERNO */}
                                {tooltipData && (
                                    <div
                                        className="absolute z-50 pointer-events-auto"
                                        style={{
                                            left: tooltipPosition.x + 16,
                                            top: tooltipPosition.y - 40
                                        }}
                                        onMouseEnter={() => setIsTooltipHovered(true)}
                                        onMouseLeave={() => {
                                            setIsTooltipHovered(false);
                                            setTooltipData(null);
                                        }}
                                    >
                                        <TooltipModalidade
                                            active
                                            payload={[{ payload: tooltipData }]}
                                            label={tooltipData.modalidade}
                                        />
                                    </div>
                                )}
                            </Painel>




                            {loadingRanking ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
                                    ))}
                                </div>
                            ) : (
                                <Painel className="col-span-12 lg:col-span-4">
                                    <PainelHeader title="Top Bandeiras" />

                                    <FiltroPeriodo
                                        periodo={periodoRanking}
                                        setPeriodo={setPeriodoRanking}
                                    />

                                    <div className="space-y-4 mt-6">
                                        {rankingFiltrado.map((b, index) => {
                                            const percentual =
                                                Math.min(
                                                    (b.valorTotal / rankingFiltrado[0].valorTotal) * 100,
                                                    100
                                                ) / 100;

                                            return (
                                                <motion.div
                                                    key={b.bandeira}
                                                    layout
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.35, delay: index * 0.06 }}
                                                    whileHover={{
                                                        y: -6,
                                                        transition: { type: "spring", stiffness: 300, damping: 20 },
                                                    }}
                                                    className="relative overflow-hidden rounded-2xl
                               bg-gradient-to-br from-primary/5 to-white
                               shadow-sm hover:shadow-xl transition-shadow
                               will-change-transform"
                                                >
                                                    {/* Barra lateral */}
                                                    <div className="absolute left-0 top-0 h-full w-1 bg-primary" />

                                                    <div className="grid grid-cols-[32px_48px_1fr] gap-4 items-center p-4">
                                                        {/* Ranking */}
                                                        <div className="flex justify-center">
                            <span className="text-lg font-extrabold text-primary">
                                #{b.ranking}
                            </span>
                                                        </div>

                                                        {/* Logo */}
                                                        <div className="flex justify-center">
                                                            <Image
                                                                src={b.logo}
                                                                alt={b.bandeira}
                                                                width={40}
                                                                height={40}
                                                                className="drop-shadow-sm"
                                                            />
                                                        </div>

                                                        {/* Infos */}
                                                        <div className="space-y-1">
                                                            <p className="font-semibold leading-none">
                                                                {b.bandeira}
                                                            </p>

                                                            <p className="text-sm text-gray-500">
                                                                R$ {b.valorTotal.toLocaleString("pt-BR")}
                                                            </p>

                                                            {/* Barra percentual */}
                                                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percentual * 100}%` }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        ease: "easeOut",
                                                                    }}
                                                                    className="h-full bg-primary rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </Painel>
                            )}


                            <Painel className="col-span-12">
                                <PainelHeader title="Ticket Médio por Bandeira"/>
                                <FiltroPeriodo
                                    periodo={periodoTicketMedio}
                                    setPeriodo={setPeriodoTicketMedio}
                                />

                                <div className="flex gap-6 my-6">
                                    <ComparativoResumo comparativo={ticketComparativo}/>
                                </div>

                                <ResponsiveContainer height={300}>
                                    <BarChart data={ticketMedio}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="bandeira"/>
                                        <YAxis/>
                                        <Tooltip
                                            formatter={(value) => [
                                                `R$ ${Number(value).toLocaleString("pt-BR")}`,
                                                "Ticket Médio",
                                            ]}
                                        />
                                        <Bar
                                            dataKey="ticketMedio"
                                            label={"Ticket Medio"}
                                            fill="#dc2626"
                                            radius={[10, 10, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Painel>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

}

/* =========================
   COMPONENTES
========================= */

function KPIComparativo({
                            label,
                            value,
                            isPercent,
                        }: {
    label: string;
    value: number;
    isPercent?: boolean;
}) {
    const {atual, anterior} = calcularComparativo(value);
    const diff = percentualDiff(atual, anterior);

    return (
        <motion.div whileHover={{y: -4}} className="bg-white rounded-2xl p-6 shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold mt-1">
                {isPercent
                    ? `${atual.toFixed(2)}%`
                    : `R$ ${atual.toLocaleString("pt-BR")}`}
            </p>
            <p className={`text-sm mt-2 ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                {diff >= 0 ? "▲" : "▼"} {diff.toFixed(2)}% vs período anterior
            </p>
        </motion.div>
    );
}

function ComparativoResumo({comparativo}: { comparativo: ResumoComparativo }) {
    const diff = percentualDiff(comparativo.atual, comparativo.anterior);
    return (
        <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Comparativo</p>
            <p className="font-bold">
                {diff >= 0 ? "▲" : "▼"} {diff.toFixed(2)}%
            </p>
        </div>
    );
}

function FiltroPeriodo({
                           periodo,
                           setPeriodo,
                       }: {
    periodo: Periodo;
    setPeriodo: (p: Periodo) => void;
}) {
    return (
        <div className="flex gap-3">
            <input
                type="date"
                value={periodo.inicio}
                onChange={(e) =>
                    setPeriodo({...periodo, inicio: e.target.value})
                }
                className="border rounded-lg px-2 py-1 text-sm"
            />
            <input
                type="date"
                value={periodo.fim}
                onChange={(e) =>
                    setPeriodo({...periodo, fim: e.target.value})
                }
                className="border rounded-lg px-2 py-1 text-sm"
            />
        </div>
    );
}

function Painel({children, className}: any) {
    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className={`bg-white rounded-2xl p-6 shadow ${className}`}
        >
            {children}
        </motion.div>
    );
}

function PainelHeader({title}: { title: string }) {
    return <h3 className="text-lg font-semibold mb-4">{title}</h3>;
}

function TooltipModalidade({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    const { total, bandeiras } = payload[0].payload;

    return (
        <div
            className="
                w-80 rounded-2xl
                bg-gradient-to-br from-white to-gray-50
                shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                border border-gray-100
                p-5
                pointer-events-auto
            "
        >

            {/* Header */}
            <div className="mb-4">
                <span className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">
                    Modalidade
                </span>
                <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                    {label}
                </h3>
            </div>

            {/* Total */}
            <div className="
                mb-4 rounded-xl
                bg-gradient-to-r from-indigo-500 to-indigo-600
                px-4 py-3
                text-white
            ">
                <p className="text-[11px] uppercase tracking-wider opacity-80">
                    Total processado
                </p>
                <p className="text-2xl font-bold tracking-tight">
                    R$ {total.toLocaleString("pt-BR")}
                </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3" />

            {/* Bandeiras */}
            <div>
                <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">
                    Bandeiras
                </p>

                <div
                    className="
                        max-h-64
                        overflow-y-auto
                        pr-2
                        space-y-3
                        scroll-premium
                    "
                >
                    {bandeiras.map((b: any) => (
                        <div
                            key={b.bandeira}
                            className="
                                flex items-center justify-between
                                rounded-xl
                                bg-white
                                px-4 py-3
                                border border-gray-200
                                shadow-sm
                                transition
                                hover:shadow-md
                                hover:border-indigo-300
                            "
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    {b.bandeira}
                                </p>

                                <span className="
                                    inline-flex items-center
                                    rounded-full
                                    bg-indigo-100
                                    px-2.5 py-0.5
                                    text-[11px]
                                    font-semibold
                                    text-indigo-700
                                ">
                                    {b.percentual.toFixed(1)}%
                                </span>
                            </div>

                            <p className="text-sm font-bold text-gray-900">
                                R$ {b.valor.toLocaleString("pt-BR")}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}




