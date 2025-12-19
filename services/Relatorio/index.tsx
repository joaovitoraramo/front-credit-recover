'use client';

import { ILista } from '@/types/requests';
import { postPadrao } from '@/services';

export async function lista({ filter }: ILista) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/relatorio/buscar`;

    return await postPadrao(uri, filter);
}
