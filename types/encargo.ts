'use client';

export interface Encargo {
    id: number | null;
    descricaoEncargo: string;
    valorEncargo: number;
    porPorcentagem: boolean;
    mensal: boolean;
    porLote?: boolean;
    porTransacao?: boolean;
}
