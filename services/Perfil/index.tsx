'use client';

import { deletaPadrao, getPadrao, postPadrao, putPadrao } from '@/services';
import { IPerfil, IPerfilDTO } from '@/types/perfil';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/perfil`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/perfil?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<IPerfilDTO>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/perfil`,
        objeto,
    );
}

export async function atualiza(objeto: Partial<IPerfilDTO>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/perfil/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: IPerfil) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/perfil/${objeto.id}`,
    );
}
