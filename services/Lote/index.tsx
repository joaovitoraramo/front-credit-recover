'use client';

import { postPadrao } from '@/services';
import { ILista } from '@/types/requests';

export async function lista({ pagination, filter }: ILista) {
    if (!pagination) return null;
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/processamento/pagamentos?page=${pagination.pageIndex}&size=${pagination.pageSize}`;

    return await postPadrao(uri, filter);
}
