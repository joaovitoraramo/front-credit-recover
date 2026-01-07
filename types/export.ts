export type ExportStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ExportColumn<T> {
    id: string;
    header: string;
    accessor: (row: T) => unknown;
}