'use client';

import type { Banco } from '@/types/banco';

const bancos: Banco[] = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    nome: `Banco ${index + 1}`,
    codigo: `${String(index + 1).padStart(3, '0')}`,
}));

export async function getBancos(
    page: number,
    pageSize: number,
): Promise<{ data: Banco[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedBancos = bancos.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedBancos,
        totalCount: bancos.length,
    };
}

export async function updateBanco(updatedBanco: Banco): Promise<Banco> {
    const index = bancos.findIndex((banco) => banco.id === updatedBanco.id);
    if (index !== -1) {
        bancos[index] = updatedBanco;
    }
    return updatedBanco;
}

export async function addBanco(newBanco: Banco): Promise<Banco> {
    const id = Math.max(...bancos.map((banco) => banco.id)) + 1;
    const bancoWithId = { ...newBanco, id };
    bancos.push(bancoWithId);
    return bancoWithId;
}
