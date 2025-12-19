'use client';

import type { Contabilidade } from '@/types/contabilidade';

const contabilidades: Contabilidade[] = Array.from(
    { length: 100 },
    (_, index) => ({
        id: index + 1,
        cnpj: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        razaoSocial: `Contabilidade ${index + 1} Ltda`,
        nomeFantasia: `Contabilidade ${index + 1}`,
        ie: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        ativo: Math.random() > 0.2,
        dataCadastro: new Date(
            Date.now() - Math.floor(Math.random() * 10000000000),
        ).toISOString(),
        email: `contato@contabilidade${index + 1}.com`,
    }),
);

export async function getContabilidades(
    page: number,
    pageSize: number,
): Promise<{ data: Contabilidade[]; totalCount: number }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedContabilidades = contabilidades.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedContabilidades,
        totalCount: contabilidades.length,
    };
}
