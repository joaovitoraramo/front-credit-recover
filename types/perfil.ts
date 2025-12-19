'use client';

export interface IPerfil {
    id: number;
    nome: string;
    permissoes: IPermissao[];
}

export interface IPerfilDTO {
    id: number;
    nome: string;
    permissoes: number[];
}

export interface IPermissao {
    id: number;
    operacao: string;
    tag: number;
}
