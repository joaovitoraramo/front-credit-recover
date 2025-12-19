'use client';

import { deletaPadrao, postPadrao, putPadrao } from '@/services';
import { Processamento } from '@/types/processamento';
import { ILista } from '@/types/requests';
import { LoteReadDTO } from '@/types/lote';

export async function lista({ pagination, filter }: ILista) {
    if (!pagination) return null;

    let uri = `${process.env.NEXT_PUBLIC_API_URL}/processamento/paginavel?page=${pagination.pageIndex}&size=${pagination.pageSize}`;

    return await postPadrao(uri, filter);
}

export async function cadastra(objeto: Partial<Processamento>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento`,
        objeto,
    );
}

export async function reprocessar(objeto: number[]) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/reprocessar`,
        objeto,
    );
}

export async function reprocessarPorLote(objeto: number[]) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/reprocessar/lote`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<Processamento>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/${objeto.id}`,
        objeto,
    );
}

export async function deleta(id: number) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/${id}`,
    );
}

export async function baixar(id: number[], tipo: string) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/pagamentos/baixar?tipo=${tipo}`,
        id,
    );
}

export async function reverterBaixa(id: number[], tipo: string) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/pagamentos/reverterbaixa?tipo=${tipo}`,
        id,
    );
}

export async function transferirLote(id: number[], data: string) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/pagamentos/transferir?data=${data}`,
        id,
    );
}

export async function transferirProcessamento(id: number[], data: string, clienteId: number) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/pagamentos/transferir/processamento?data=${data}&clienteId=${clienteId}`,
        id,
    );
}

export async function aplicarEncargosLote(lote: LoteReadDTO) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/processamento/pagamentos/encargos`,
        lote,
    );
}
