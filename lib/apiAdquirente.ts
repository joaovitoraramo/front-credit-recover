'use client';

import type { Adquirente } from '@/types/adquirente';

const adquirentes: Adquirente[] = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    nome: `Adquirente ${index + 1}`,
}));

export async function getAdquirentes(
    page: number,
    pageSize: number,
): Promise<{ data: Adquirente[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedAdquirentes = adquirentes.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedAdquirentes,
        totalCount: adquirentes.length,
    };
}

export async function updateAdquirente(
    updatedAdquirente: Adquirente,
): Promise<Adquirente> {
    const index = adquirentes.findIndex(
        (adquirente) => adquirente.id === updatedAdquirente.id,
    );
    if (index !== -1) {
        adquirentes[index] = updatedAdquirente;
    }
    return updatedAdquirente;
}

export async function addAdquirente(
    newAdquirente: Adquirente,
): Promise<Adquirente> {
    const id = Math.max(...adquirentes.map((adquirente) => adquirente.id)) + 1;
    const adquirenteWithId = { ...newAdquirente, id };
    adquirentes.push(adquirenteWithId);
    return adquirenteWithId;
}
