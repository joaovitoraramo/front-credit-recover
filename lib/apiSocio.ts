'use client';

import type { Socio } from '@/types/socio';
import { getClients } from './api';

let socios: Socio[] = [];

async function initializeSocios() {
    const { data: clients } = await getClients(1, 100);

    socios = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        cpf: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        nome: `Sócio ${index + 1}`,
        rg: `${Math.floor(1000000 + Math.random() * 9000000)}`,
        dataNascimento: new Date(
            Date.now() - Math.floor(Math.random() * 1000000000000),
        )
            .toISOString()
            .split('T')[0],
        clientes: clients.slice(0, Math.floor(Math.random() * 5) + 1),
        nomePai: `Pai do Sócio ${index + 1}`,
        nomeMae: `Mãe do Sócio ${index + 1}`,
    }));
}

initializeSocios();

export async function getSocios(
    page: number,
    pageSize: number,
): Promise<{ data: Socio[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSocios = socios.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedSocios,
        totalCount: socios.length,
    };
}

export async function updateSocio(updatedSocio: Socio): Promise<Socio> {
    const index = socios.findIndex((socio) => socio.id === updatedSocio.id);
    if (index !== -1) {
        socios[index] = updatedSocio;
    }
    return updatedSocio;
}

export async function addSocio(newSocio: Socio): Promise<Socio> {
    const id = Math.max(...socios.map((socio) => socio.id)) + 1;
    const socioWithId = { ...newSocio, id };
    socios.push(socioWithId);
    return socioWithId;
}
