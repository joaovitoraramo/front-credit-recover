'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { BandeirasCliente } from '@/types/bandeirasCliente';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeirascliente`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeirascliente?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<BandeirasCliente>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeirascliente`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<BandeirasCliente>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeirascliente/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: BandeirasCliente) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeirascliente/${objeto.id}`,
    );
}
