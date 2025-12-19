'use client';

import { NextResponse } from 'next/server';
import { processamentos } from '@/lib/apiProcessamento';

export async function onDeleteProcessamento(id: number) {
    try {
        processamentos = processamentos.filter((p) => p.id !== id);
        return NextResponse.json({
            message: 'Processamento deletado com sucesso!',
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro ao deletar processamento.' },
            { status: 500 },
        );
    }
}
