'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { Client as Cliente, ClienteDTO } from '@/types/client';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/cliente`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/cliente?${key}=${value}`;
        }
    }

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
