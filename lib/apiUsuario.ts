'use client';

import type { Usuario } from '@/types/usuario';
import { getClients } from './api';

let usuarios: Usuario[] = [];

async function initializeUsuarios() {
    const { data: clients } = await getClients(1, 100);

    usuarios = Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        email: `usuario${index + 1}@example.com`,
        senha: `senha${index + 1}`,
        nome: `Usuário ${index + 1}`,
        usuarioCriacao: 1,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        usuarioAtualizacao: 1,
        clientes: clients.slice(0, Math.floor(Math.random() * 5) + 1),
    }));
}

initializeUsuarios();

export async function getUsuarios(
    page: number,
    pageSize: number,
): Promise<{ data: Usuario[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsuarios = usuarios.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedUsuarios,
        totalCount: usuarios.length,
    };
}

export async function updateUsuario(updatedUsuario: Usuario): Promise<Usuario> {
    const index = usuarios.findIndex(
        (usuario) => usuario.id === updatedUsuario.id,
    );
    if (index !== -1) {
        usuarios[index] = {
            ...updatedUsuario,
            dataAtualizacao: new Date().toISOString(),
            usuarioAtualizacao: 1, // Assuming the current user has ID 1
        };
    }
    return usuarios[index];
}

export async function addUsuario(
    newUsuario: Omit<Usuario, 'id'>,
): Promise<Usuario> {
    const id = Math.max(...usuarios.map((usuario) => usuario.id)) + 1;
    const usuarioWithId = {
        ...newUsuario,
        id,
        usuarioCriacao: 1, // Assuming the current user has ID 1
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        usuarioAtualizacao: 1, // Assuming the current user has ID 1
    };
    usuarios.push(usuarioWithId);
    return usuarioWithId;
}
