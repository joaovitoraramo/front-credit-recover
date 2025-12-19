'use client';

import type { Bin } from './bin';
import { Adquirente } from '@/types/adquirente';

export interface Bandeira {
    id: number;
    nome?: string;
    tipo?: 'C' | 'D';
    tipoAdicional?: TModalidade;
    bins?: Bin[];
    logo?: string;
}

export interface BandeiraDTO {
    id: number;
    nome?: string;
    tipo?: 'C' | 'D';
    tipoAdicional?: TModalidade;
}

export type TModalidade = 'AV' | 'PP' | 'VC' | 'CD' | 'PX';
