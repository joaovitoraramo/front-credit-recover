'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { BandeiraConfig } from '@/types/bandeirasCliente';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeirasconfig`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/bandeirasconfig?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<BandeiraConfig>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeirasconfig`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<BandeiraConfig>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeirasconfig/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: BandeiraConfig) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/bandeirasconfig/${objeto.id}`,
    );
}
