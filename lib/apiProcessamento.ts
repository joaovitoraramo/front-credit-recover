'use client';

import type { Processamento, ProcessamentoFilter } from '@/types/processamento';
import { getClients } from '@/lib/api';
import { getBandeiras } from '@/lib/apiBandeira';

export let processamentos: Processamento[] = [];

function generateProcessamentos(count: number): Processamento[] {
    const bandeiras = [
        'Visa',
        'Mastercard',
        'American Express',
        'Elo',
        'Hipercard',
    ];
    const tipoProdutos = ['Crédito', 'Débito'];

    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        bandeira: {
            id: Math.floor(Math.random() * 100) + 1,
            nome: bandeiras[Math.floor(Math.random() * bandeiras.length)],
            tipo: Math.random() > 0.5 ? 'credito' : 'debito',
            bins: [],
        },
        cliente: {
            id: Math.floor(Math.random() * 100) + 1,
            nomeFantasia: `Cliente ${index + 1}`,
            cnpj: `${Math.floor(
                10000000000000 + Math.random() * 90000000000000,
            )}`,
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
            regimeTributario: [
                'Simples Nacional',
                'Lucro Presumido',
                'Lucro Real',
            ][Math.floor(Math.random() * 3)],
            erp: ['Sistema A', 'Sistema B', 'Sistema C', 'Nenhum'][
                Math.floor(Math.random() * 4)
            ],
            tef: ['Integrado', 'Não Integrado', 'Não Possui'][
                Math.floor(Math.random() * 3)
            ],
            loginSitef: `login${index + 1}`,
            senhaSitef: `senha${index + 1}`,
            linkSitef: `https://sitef.empresa${index + 1}.com`,
            contabilidade: null,
            bandeirasCliente: [],
        },
        qtdeParcelas: Math.floor(Math.random() * 12) + 1,
        parcela: Math.floor(Math.random() * 12) + 1,
        valorTotal: Number.parseFloat((Math.random() * 10000).toFixed(2)),
        valorParcela: Number.parseFloat((Math.random() * 1000).toFixed(2)),
        valorLiquido: Number.parseFloat((Math.random() * 9000).toFixed(2)),
        taxa: Number.parseFloat((Math.random() * 5).toFixed(2)),
        totalTaxa: Number.parseFloat((Math.random() * 500).toFixed(2)),
        lancManual: Math.random() > 0.5,
        dataTransacao: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        )
            .toISOString()
            .split('T')[0],
        horaTransacao: new Date().toTimeString().split(' ')[0],
        dataPagamento: new Date(
            Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        )
            .toISOString()
            .split('T')[0],
        nsuHost: Math.random().toString(36).substring(2, 12),
        bin: Math.floor(100000 + Math.random() * 900000).toString(),
        tipoProduto:
            tipoProdutos[Math.floor(Math.random() * tipoProdutos.length)],
        lote: { id: Math.floor(Math.random() * 1000) + 1 },
    }));
}

processamentos = generateProcessamentos(1000);

export async function getProcessamentos(
    page: number,
    pageSize: number,
    filter?: ProcessamentoFilter,
): Promise<{ data: Processamento[]; totalCount: number }> {
    let filteredProcessamentos = [...processamentos];

    if (filter) {
        filteredProcessamentos = filteredProcessamentos.filter((proc) => {
            const dataTransacao = new Date(proc.dataTransacao);
            const matchesDataInicial =
                !filter.dataInicial || dataTransacao >= filter.dataInicial;
            const matchesDataFinal =
                !filter.dataFinal || dataTransacao <= filter.dataFinal;
            const matchesCliente =
                !filter.clienteId || proc.cliente.id === filter.clienteId;
            const matchesBandeira =
                !filter.bandeiraIds.length ||
                filter.bandeiraIds.includes(proc.bandeira.id);

            return (
                matchesDataInicial &&
                matchesDataFinal &&
                matchesCliente &&
                matchesBandeira
            );
        });
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProcessamentos = filteredProcessamentos.slice(start, end);

    // Simula um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        data: paginatedProcessamentos,
        totalCount: filteredProcessamentos.length,
    };
}

// Atualizar a função para buscar clientes
export async function searchClientes(query: string) {
    const { data: clientes } = await getClients(1, 1000); // Busca todos os clientes (limite de 1000)
    return clientes.filter((cliente) =>
        cliente.nomeFantasia.toLowerCase().includes(query.toLowerCase()),
    );
}

// Atualizar a função para buscar bandeiras
export async function searchBandeiras(query: string) {
    const { data: bandeiras } = await getBandeiras(1, 1000); // Busca todas as bandeiras (limite de 1000)
    return bandeiras.filter((bandeira) =>
        bandeira.nome.toLowerCase().includes(query.toLowerCase()),
    );
}

export { generateProcessamentos };
