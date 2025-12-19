'use client';

import { BandeiraDTO } from '@/types/bandeira';

export interface Bin {
    id: number;
    bin: string;
    descricao: string;
    tipo: 'D' | 'C';
}

export interface BinDTO {
    id: number;
    bin: string;
    descricao: string;
    tipo: 'D' | 'C';
    bandeira: BandeiraDTO;
}
