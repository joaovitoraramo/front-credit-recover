'use client';

import { Button } from '@/components/ui/button';
import React, { LegacyRef, ReactNode } from 'react';

interface IProps {
    onClick?: (e?: any) => void;
    variant: 'outline' | 'ghost' | 'destructive';
    icon?: ReactNode;
    name?: string;
    ref?: LegacyRef<any>;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    className?: string;
    flex?: boolean;
    transparent?: boolean;
    type?: 'button' | 'reset' | 'submit';
    chave?: React.Key | null | undefined;
    title?: string | undefined;
    style?: React.CSSProperties | undefined;
}

export default function ({
    onClick,
    variant,
    name,
    icon,
    ref,
    size,
    disabled,
    className,
    flex,
    transparent,
    type,
    chave,
    title,
    style,
}: IProps) {
    const baseClassName = `font-bold py-2 px-4 rounded-full ${
        flex ? 'flex' : ''
    } mr-2 items-center transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10`;

    let variantClassName = '';

    switch (variant) {
        case 'ghost':
            variantClassName = `bg-transparent text-primary ${
                transparent
                    ? 'hover:bg-transparent hover:text-primary '
                    : 'hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/50'
            }`;
            break;
        case 'outline':
            variantClassName = `bg-primary text-white hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/50`;
            break;
        case 'destructive':
            variantClassName = `${
                transparent
                    ? 'bg-transparent text-red-500 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-700/50'
                    : 'bg-red-500 text-white hover:text-red-500 hover:bg-transparent hover:shadow-lg hover:shadow-red-700/50'
            }`;
            break;
    }

    return (
        <Button
            style={style}
            key={chave}
            type={type}
            disabled={disabled}
            size={size}
            ref={ref}
            onClick={onClick}
            variant={variant}
            className={`${className} ${baseClassName} ${variantClassName}`}
            title={title}
        >
            {icon}
            {name}
        </Button>
    );
}
