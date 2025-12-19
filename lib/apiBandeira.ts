'use client';

import type { Bandeira } from '@/types/bandeira';

const bandeiras: Bandeira[] = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    nome: `Bandeira ${index + 1}`,
    tipo: index % 2 === 0 ? 'credito' : 'debito',
}));

export async function getBandeiras(
    page: number,
    pageSize: number,
): Promise<{ data: Bandeira[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedBandeiras = bandeiras.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedBandeiras,
        totalCount: bandeiras.length,
    };
}

export async function updateBandeira(
    updatedBandeira: Bandeira,
): Promise<Bandeira> {
    const index = bandeiras.findIndex(
        (bandeira) => bandeira.id === updatedBandeira.id,
    );
    if (index !== -1) {
        bandeiras[index] = updatedBandeira;
    }
    return updatedBandeira;
}

export async function addBandeira(newBandeira: Bandeira): Promise<Bandeira> {
    const id = Math.max(...bandeiras.map((bandeira) => bandeira.id)) + 1;
    const bandeiraWithId = { ...newBandeira, id };
    bandeiras.push(bandeiraWithId);
    return bandeiraWithId;
}
