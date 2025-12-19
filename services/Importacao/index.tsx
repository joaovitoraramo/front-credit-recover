'use client';

import { postArquivo, postPadrao } from '@/services';
import {TipoAdquirente, TipoImportacao} from "@/types/tipoImportacao";

export async function importar(idCliente: number, arquivo: File | undefined, tipoImportacao: TipoImportacao, tipoAdquirente: TipoAdquirente) {
    const formData = new FormData();

    if (arquivo) {
        formData.append('file', arquivo);
    }

    return await postArquivo(
        `${process.env.NEXT_PUBLIC_API_URL}/importacao/form?cliente=${idCliente}&tipo=${tipoImportacao}&adquirente=${tipoAdquirente}`,
        formData,
    );
}
