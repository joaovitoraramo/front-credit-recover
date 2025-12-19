'use client';

import { getPadrao } from '@/services';

export async function lista(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/bin`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/bin?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}
