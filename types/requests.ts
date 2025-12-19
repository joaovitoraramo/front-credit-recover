'use client';

import { PaginationState } from '@tanstack/react-table';
import { ProcessamentoFilter } from '@/types/processamento';

export interface ILista {
    pagination?: PaginationState;
    filter?: ProcessamentoFilter;
}
