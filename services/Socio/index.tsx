'use client';

import {
    deletaPadrao,
    getPadrao,
    getResponsePadrao,
    postArquivo,
    postPadrao,
    putPadrao,
} from '@/services';
import { Socio, SocioDTO } from '@/types/socio';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/socio`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/socio?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}

export async function cadastra(objeto: Partial<SocioDTO>) {
    return await postPadrao(`${process.env.NEXT_PUBLIC_API_URL}/socio`, objeto);
}

export async function cadastraArquivos(
    id: number,
    contratoSocial: File | undefined,
    contratoLgpd: File | undefined,
    documento: File | undefined,
) {
    const formData = new FormData();

    if (contratoSocial) {
        formData.append('contratoSocial', contratoSocial);
    }
    if (contratoLgpd) {
        formData.append('contratoLgpd', contratoLgpd);
    }
    if (documento) {
        formData.append('documento', documento);
    }

    return await postArquivo(
        `${process.env.NEXT_PUBLIC_API_URL}/socio/arquivos/${id}`,
        formData,
    );
}

export async function atualiza(objeto: Partial<SocioDTO>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/socio/${objeto.id}`,
        objeto,
    );
}

export async function deleta(objeto: Socio) {
    return await deletaPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/socio/${objeto.id}`,
    );
}

export async function downloadArquivo(id: number, nome: string) {
    return await getResponsePadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/socio/${id}/${nome}`,
    );
}
