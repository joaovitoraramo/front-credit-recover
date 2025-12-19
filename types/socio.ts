'use client';

import type { Client } from './client';

export interface Socio {
    id: number;
    cpf: string;
    nome: string;
    rg: string;
    dataNascimento: string; // We'll use string for LocalDate
    clientes: Client[];
    nomePai: string;
    nomeMae: string;
    contratoSocial?: File;
    documento?: File;
    contratoLgpd?: File;
}

export interface SocioDTO {
    id: number;
    cpf: string;
    nome: string;
    rg: string;
    dataNascimento: string;
    clientesId: number[];
    nomePai: string;
    nomeMae: string;
    contratoSocial?: File;
    documento?: File;
    contratoLgpd?: File;
}
