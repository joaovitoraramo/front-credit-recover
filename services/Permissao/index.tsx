'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { IPermissao } from '@/types/perfil';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/permissao`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/permissao?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}
