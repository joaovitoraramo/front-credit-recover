'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import {ExportColumn} from "@/types/export";

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

export function downloadExcel<T>(
    data: T[],
    columns: ExportColumn<T>[],
    options?: {
        fileName?: string;
        sheetName?: string;
    }
): boolean {
    if (!data?.length || !columns?.length) {
        return false;
    }

    const header = columns.map(col => col.header);

    const body = data.map(row =>
        columns.map(col => col.accessor(row))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([
        header,
        ...body,
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        options?.sheetName ?? 'Dados'
    );

    const wbout = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    });

    const date = new Date().toISOString().slice(0, 10);

    saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        options?.fileName ?? `export_${date}.xlsx`
    );

    return true;
}
