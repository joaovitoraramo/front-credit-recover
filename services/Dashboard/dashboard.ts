// services/Dashboard/dashboard.ts

'use client';

/* =========================
   MOCK (temporário)
========================= */

import {RankingBandeira, ResumoVendas, TicketMedioBandeira, VendasPorModalidade} from "@/types/dashboard";
import {getPadrao} from "@/services";

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
    return await getPadrao(`${process.env.NEXT_PUBLIC_API_URL}/relatorio/ranking-bandeiras?${new URLSearchParams(params)}`);
}

export async function fetchTicketMedio(
    params: any,
): Promise<TicketMedioBandeira[]> {
    return await getPadrao(`${process.env.NEXT_PUBLIC_API_URL}/relatorio/ticket-medio?${new URLSearchParams(params)}`);
}
