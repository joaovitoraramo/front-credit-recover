'use client';

import type { Contabilidade } from './contabilidade';
import type { BandeirasCliente, BandeiraClienteDTO } from './bandeirasCliente';

export interface ClientAdditionalDetail {
    id?: string; // Opcional, para identificar no backend ou localmente. Use um ID negativo temporário para novos itens.
    type: 'SITE' | 'LOGIN' | 'SENHA' | 'TELEFONE' | 'OUTROS'; // Categoria da informação (ex: "Site", "Login", "Telefone Adicional")
    label: string; // Um rótulo amigável para o usuário (ex: "Site Principal", "Login do Painel", "Telefone Suporte")
    value: string; // O valor da informação (ex: "https://exemplo.com", "usuario@exemplo.com", "senha123", "(11) 98765-4321")
    notes?: string; // Campo opcional para anotações adicionais sobre este item
    active: boolean; // Booleano para soft delete (se o item está ativo ou logicamente excluído)
    deleted: boolean; // Booleano para marcar se o item foi excluído na UI antes de salvar
}

export interface ClientCardData {
    id: string | null; // ID único para cada card gerado no frontend
    generalLabel: string;
    siteValue?: string;
    loginValue?: string;
    passwordValue?: string;
    phoneValue?: string;
    otherLabel?: string;
    otherValue?: string;
    notes?: string;
    deleted: boolean;
    active: boolean;
}


export interface Client {
    id: number;
    cnpj: string;
    nomeFantasia: string;
    razaoSocial: string;
    endereco: string;
    cep: string;
    telefone: string;
    celular: string;
    email: string;
    emailSecundario: string;
    pdvs: number;
    pos: number;
    regimeTributario: string;
    erp: string;
    tef: string;
    loginSitef: string;
    senhaSitef: string;
    linkSitef: string;
    contabilidade?: Contabilidade | null;
    bandeirasCliente: BandeirasCliente[];
    deleta?: boolean;
    adicionais?: ClientCardData[] | ClientAdditionalDetail[];
}

export interface ClienteDTO {
    id: number;
    cnpj: string;
    nomeFantasia: string;
    razaoSocial: string;
    endereco: string;
    cep: string;
    telefone: string;
    celular: string;
    email: string;
    emailSecundario: string;
    pdvs: number;
    pos: number;
    regimeTributario: string;
    erp: string;
    tef: string;
    loginSitef: string;
    senhaSitef: string;
    linkSitef: string;
    contabilidadeId: number;
    bandeirasCliente: BandeiraClienteDTO[];
    adicionais?: ClientCardData[] | ClientAdditionalDetail[];
}
