// services/Dashboard/dashboard.ts

'use client';

/* =========================
   MOCK (temporário)
========================= */

import {
    DashboardVendasDTO,
    RankingBandeira,
    ResumoVendas,
    TicketMedioBandeira,
    VendasPorModalidade
} from "@/types/dashboard";
import {getPadrao} from "@/services";

const data: DashboardVendasDTO = {
    resumo: {
        valorBruto: 125430.9,
        valorLiquido: 112380.22,
        despesas: 13050.68,
        taxaMedia: 10.4,
    },
    vendasPorModalidade: [
        {
            modalidade: "Crédito",
            total: 58900,
            bandeiras: [
                {bandeira: "Visa", valor: 30000, percentual: 50.9},
                {bandeira: "Mastercard", valor: 21000, percentual: 35.6},
                {bandeira: "Elo", valor: 7900, percentual: 13.5},
            ],
        },
        {
            modalidade: "Débito",
            total: 39000,
            bandeiras: [
                {bandeira: "Visa", valor: 22000, percentual: 56.4},
                {bandeira: "Mastercard", valor: 17000, percentual: 43.6},
            ],
        },
    ],
    rankingBandeiras: [
        {bandeira: "Visa", logo: "/logo.svg", valorTotal: 58000, ranking: 1},
        {bandeira: "Mastercard", logo: "/logo.svg", valorTotal: 41000, ranking: 2},
        {bandeira: "Elo", logo: "/logo.svg", valorTotal: 17800, ranking: 3},
    ],
    ticketMedioPorBandeira: [
        {bandeira: "Visa", valorTotal: 58000, ticketMedio: 42.3, quantidadeTransacoes: 1370},
        {bandeira: "Mastercard", valorTotal: 41000, ticketMedio: 38.9, quantidadeTransacoes: 1050},
        {bandeira: "Elo", valorTotal: 17800, ticketMedio: 33.5, quantidadeTransacoes: 280},
    ],
};

/* =========================
   HELPERS
========================= */
const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

/* =========================
   REQUESTS
========================= */

export async function fetchResumo(params: any): Promise<ResumoVendas> {
    return await getPadrao(`${process.env.NEXT_PUBLIC_API_URL}/relatorio/resumo?${new URLSearchParams(params)}`);
}

export async function fetchVendasPorModalidade(
    params: any,
): Promise<VendasPorModalidade[]> {
    return await getPadrao(`${process.env.NEXT_PUBLIC_API_URL}/relatorio/modalidades?${new URLSearchParams(params)}`);
}

export async function fetchRankingBandeiras(
    params: any,
): Promise<RankingBandeira[]> {
    // return await getPadrao(`/dashboard/ranking-bandeiras?${new URLSearchParams(params)}`);

    await delay(1200);
    return data.rankingBandeiras;
}

export async function fetchTicketMedio(
    params: any,
): Promise<TicketMedioBandeira[]> {
    // return await getPadrao(`/dashboard/ticket-medio?${new URLSearchParams(params)}`);

    await delay(1500);
    return data.ticketMedioPorBandeira;
}
