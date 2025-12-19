'use client';

import type { Client } from '@/types/client';
import { getContabilidades } from './apiContabilidade';

let clients: Client[] = [];

async function initializeClients() {
    const { data: contabilidades } = await getContabilidades(1, 100);

    clients = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        cnpj: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        nomeFantasia: `Empresa ${index + 1}`,
        razaoSocial: `Empresa ${index + 1} Ltda`,
        endereco: `Rua ${index + 1}, ${index * 100}`,
        cep: `${Math.floor(10000000 + Math.random() * 90000000)}`,
        telefone: `(${Math.floor(10 + Math.random() * 90)}) ${Math.floor(
            1000 + Math.random() * 9000,
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
        celular: `(${Math.floor(10 + Math.random() * 90)}) 9${Math.floor(
            1000 + Math.random() * 9000,
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `contato@empresa${index + 1}.com`,
        emailSecundario: `financeiro@empresa${index + 1}.com`,
        pdvs: Math.floor(Math.random() * 10) + 1,
        pos: Math.floor(Math.random() * 5),
        regimeTributario: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'][
            Math.floor(Math.random() * 3)
        ],
        erp: ['Sistema A', 'Sistema B', 'Sistema C', 'Nenhum'][
            Math.floor(Math.random() * 4)
        ],
        tef: ['Integrado', 'Não Integrado', 'Não Possui'][
            Math.floor(Math.random() * 3)
        ],
        loginSitef: `login${index + 1}`,
        senhaSitef: `senha${index + 1}`,
        linkSitef: `https://sitef.empresa${index + 1}.com`,
        contabilidade:
            contabilidades[Math.floor(Math.random() * contabilidades.length)] ||
            null,
    }));
}

initializeClients();

export async function getClients(
    page: number,
    pageSize: number,
): Promise<{ data: Client[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedClients = clients.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedClients,
        totalCount: clients.length,
    };
}

export async function updateClient(updatedClient: Client): Promise<Client> {
    const index = clients.findIndex((client) => client.id === updatedClient.id);
    if (index !== -1) {
        clients[index] = updatedClient;
    }
    return updatedClient;
}

export async function addClient(newClient: Client): Promise<Client> {
    const id = Math.max(...clients.map((client) => client.id)) + 1;
    const clientWithId = { ...newClient, id };
    clients.push(clientWithId);
    return clientWithId;
}
