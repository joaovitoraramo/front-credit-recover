'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { Adquirente } from '@/types/adquirente';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/adquirente`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/adquirente?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function listaPorClienteBandeira(clienteId: number, bandeiraId: number) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/adquirente/cliente-bandeira?clienteId=${clienteId}&bandeiraId=${bandeiraId}`;

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<Adquirente>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/adquirente`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<Adquirente>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/adquirente/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: Adquirente) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/adquirente/${objeto.id}`,
    );
}
