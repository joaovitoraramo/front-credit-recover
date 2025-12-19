'use client';

import type { Client as Cliente } from './client';
import { IPerfil } from '@/types/perfil';

export interface Usuario {
    id: number;
    email: string;
    senha: string;
    nome: string;
    usuarioCriacao?: number;
    dataCriacao?: string;
    dataAtualizacao?: string;
    usuarioAtualizacao?: number;
    clientes: Cliente[];
    isSuporte: boolean;
    todasAsLojas?: boolean;
    perfis: IPerfil[];
}

export interface UsuarioDTO {
    id: number;
    email: string;
    senha: string;
    nome: string;
    usuarioCriacao?: number;
    dataCriacao?: string;
    dataAtualizacao?: string;
    usuarioAtualizacao?: number;
    clientesId: number[];
    perfis: number[];
    isSuporte: boolean;
    todasAsLojas?: boolean;
}
