'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDisplayDate = (date: Date | null) => {
    return date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : '';
};

export function parseDateStringDDMMYYYY(dateString: string): Date | null {
    const parts = dateString.split('/');

    if (parts.length !== 3) {
        return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null;
    }

    const date = new Date(year, month, day);

    if (
        date &&
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
    ) {
        return date;
    }

    return null;
}

export const SvgDisplay = ({
    svgContent,
    width,
    height,
}: {
    svgContent: string | undefined;
    width?: string;
    height?: string;
}) => {
    if (svgContent) {
        const style = {
            width: width || '100%',
            height: height || 'auto',
        };

        return (
            <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                style={style}
            />
        );
    }
    return null;
};

export function stringSvgToDataUrl(svgString: string | undefined) {
    if (svgString) {
        const encodedSvg = encodeURIComponent(svgString);
        return `data:image/svg+xml,${encodedSvg}`;
    }
    return '';
}
