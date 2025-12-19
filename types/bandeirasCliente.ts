'use client';

import type { Bandeira } from './bandeira';
import type { Banco } from './banco';
import type { Adquirente } from './adquirente';
import { Encargo } from '@/types/encargo';

export interface BandeiraConfig {
    id?: number | null;
    parcela: number;
    taxa: number;
    diasPagamento: number;
    tipo?: string;
    deleta?: boolean;
}

export interface BandeirasCliente {
    id?: number | null;
    agencia: string;
    conta: string;
    bandeira?: Bandeira;
    banco?: Banco;
    adquirente?: Adquirente;
    diasPagamento: number;
    bandeirasConfig: BandeiraConfig[];
    encargos?: Encargo[];
    deleta?: boolean;
    diaFixo?: string;
    diaSemanaCorte?: number;
}

export interface BandeiraClienteDTO {
    id?: number | null;
    agencia: string;
    clienteId?: number;
    conta: string;
    bandeiraId?: number;
    bancoId?: number;
    adquirenteId?: number;
    diasPagamento: number;
    diaFixo?: string;
    diaSemanaCorte?: number;
    bandeirasConfig: BandeiraConfig[];
    deleta?: boolean;
}
