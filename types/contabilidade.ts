'use client';

export interface Contabilidade {
    id: number;
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    ie?: string;
    ativo?: boolean;
    dataCadastro?: string;
    email?: string;
}
