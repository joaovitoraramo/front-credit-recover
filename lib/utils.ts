'use client';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TModalidade } from '@/types/bandeira';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function applyDateMask(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (!match) return '';
    const [, day, month, year] = match;
    if (year) {
        return `${day}/${month}/${year}`;
    } else if (month) {
        return `${day}/${month}`;
    } else if (day) {
        return day;
    }
    return '';
}

export function colunaModalidade(value?: TModalidade) {
    switch (value) {
        case 'AV':
            return 'A vista';
        case 'CD':
            return 'Carteira digital';
        case 'PP':
            return 'Pré pago';
        case 'VC':
            return 'Voucher';
        case 'PX':
            return 'Pix';
        default:
            return 'Sem modalidade';
    }
}
