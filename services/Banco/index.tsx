'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { Banco } from '@/types/banco';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/banco`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/banco?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<Banco>) {
    return await postPadrao(`${process.env.NEXT_PUBLIC_API_URL}/banco`, objeto);
}

export async function atualiza(objeto: Partial<Banco>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/banco/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: Banco) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/banco/${objeto.id}`,
    );
}
