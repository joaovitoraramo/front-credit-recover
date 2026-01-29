// types/dashboard.ts

export interface Periodo {
    inicio: string;
    fim: string;
}

export interface ResumoVendas {
    valorBruto: number;
    valorLiquido: number;
    despesas: number;
    taxaMedia: number;
}

export interface ResumoComparativo {
    atual: number;
    anterior: number;
}

export interface BandeiraValor {
    bandeira: string;
    valor: number;
    percentual: number;
}

export interface VendasPorModalidade {
    modalidade: string;
    total: number;
    bandeiras: BandeiraValor[];
}

export interface RankingBandeira {
    bandeira: string;
    logo: string;
    valorTotal: number;
    ranking: number;
}

export interface TicketMedioBandeira {
    bandeira: string;
    valorTotal: number;
    ticketMedio: number;
    quantidadeTransacoes: number;
}

export interface DashboardVendasDTO {
    resumo: ResumoVendas;
    vendasPorModalidade: VendasPorModalidade[];
    rankingBandeiras: RankingBandeira[];
    ticketMedioPorBandeira: TicketMedioBandeira[];
}