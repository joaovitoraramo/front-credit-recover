'use client';

import type { ReactNode } from 'react';

interface IProps {
    titulo: string;
    tamanho: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
}

export default function ({ titulo, tamanho, className }: IProps): ReactNode {
    const Tag = tamanho;

    if (
        Tag === 'h2' ||
        Tag === 'h3' ||
        Tag === 'h4' ||
        Tag === 'h5' ||
        Tag === 'h6'
    ) {
        return (
            <Tag className={`mb-8 font-bold text-gray-800 ${className || ''}`}>
                {titulo}
            </Tag>
        );
    } else {
        return null;
    }
}
