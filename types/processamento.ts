'use client';

import type { Bandeira } from './bandeira';
import type { Client } from './client';
import type { Lote } from './lote';
import { Usuario } from '@/types/usuario';

export interface Processamento {
    id: number;
    bandeira: Bandeira;
    cliente: Client;
    qtdeParcelas: number;
    parcela: number;
    valorTotal: number;
    valorParcela: number;
    valorLiquido: number;
    taxa: number;
    totalTaxa: number;
    lancManual: boolean;
    dataTransacao: string;
    horaTransacao: string;
    dataPagamento: string;
    nsuHost: string;
    bin: string;
    tipoProduto: string;
    lote: Lote;
    dataBaixa: string | null;
    horaBaixa: string | null;
    usuarioBaixa: Usuario | null;
    nomeProduto: string;
    descTransacao: string;
    rede: string;
    encargo: number;
}

export interface ProcessamentoDTO {
    bandeiraId: number;
    clienteId: number;
    qtdeParcelas: number;
    valorTotal: number;
    lancManual: boolean;
    dataTransacao: string;
    horaTransacao: string;
    nsuHost: string;
    encargo?: number;
    adquirenteId?: number;
}

export interface ProcessamentoFilter {
    dataInicial?: string;
    dataFinal?: string;
    clienteIds?: number[];
    bandeiraIds: number[];
    valorTotal?: string;
    bandeira?: string;
    valorLiquido?: string;
    valorTransacao?: string;
    valorTaxa?: string;
    valorEncargos?: string;
    taxa?: string;
    bin?: string;
    semBandeira?: boolean;
    dataDePagamento?: boolean;
    loteId?: number;
    tipo?: string;
}
