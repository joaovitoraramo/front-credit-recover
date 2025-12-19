'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { Contabilidade } from '@/types/contabilidade';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/contabilidade`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/contabilidade?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<Contabilidade>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/contabilidade`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<Contabilidade>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/contabilidade/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: Contabilidade) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/contabilidade/${objeto.id}`,
    );
}
