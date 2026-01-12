'use client';

import {deletaPadrao, getPadrao, postPadrao, putPadrao} from '@/services';
import {Client as Cliente, ClienteDTO} from '@/types/client';

export async function lista(
    filtro: Record<string, any> | null
) {
    const params = new URLSearchParams();

    // filtros
    if (filtro) {
        Object.entries(filtro).forEach(([key, value]) => {
            if (value !== null && value !== undefined && String(value).trim() !== "") {
                params.append(key, String(value));
            }
        });
    }

    const uri = `${process.env.NEXT_PUBLIC_API_URL}/cliente?${params.toString()}`;

    return await getPadrao(uri);
}

export async function listaPaginavel(
    filtro: Record<string, any> | null,
    pagination: { pageIndex: number; pageSize: number }
) {
    const params = new URLSearchParams();

    // filtros
    if (filtro) {
        Object.entries(filtro).forEach(([key, value]) => {
            if (value !== null && value !== undefined && String(value).trim() !== "") {
                params.append(key, String(value));
            }
        });
    }

    // paginação Spring
    params.append("page", String(pagination.pageIndex));
    params.append("size", String(pagination.pageSize));

    const uri = `${process.env.NEXT_PUBLIC_API_URL}/cliente/paginavel?${params.toString()}`;

    return await getPadrao(uri);
}

export async function listaPorId(id: number) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/cliente/${id}`;

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<ClienteDTO>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/cliente`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<ClienteDTO>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/cliente/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: Cliente) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/cliente/${objeto.id}`,
    );
}
