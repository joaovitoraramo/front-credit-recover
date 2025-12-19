'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { Bandeira } from '@/types/bandeira';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeira`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeira?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function listaPorId(id: number) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeira/${id}`;

    return await getPadrao(uri);
}

export async function listaPorClienteTipo(
    filtro: any | null,
    idCliente: number,
    tipo?: string,
) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeira/cliente/${idCliente}`;
    const params = new URLSearchParams();

    if (tipo) {
        params.append('tipo', tipo);
    }

    if (filtro) {
        for (const key in filtro) {
            if (
                filtro.hasOwnProperty(key) &&
                filtro[key] !== undefined &&
                filtro[key] !== null
            ) {
                params.append(key, filtro[key]);
            }
        }
    }

    const queryString = params.toString();
    if (queryString) {
        uri += `?${queryString}`;
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<Bandeira>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeira`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<Bandeira>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeira/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: Bandeira) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeira/${objeto.id}`,
    );
}
