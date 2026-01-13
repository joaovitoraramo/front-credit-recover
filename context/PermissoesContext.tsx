// context/PermissoesContext.ts
"use client";

import {usePermissoesStore} from '@/store/permissoesStore';
import {ReactNode} from 'react';

export const PermissoesProvider = ({children}: { children: ReactNode }) => {
    return <>{children}</>;
};

export const usePermissoes = () => {
    const usuario = usePermissoesStore((state) => state.usuario);
    const setUsuario = usePermissoesStore((state) => state.setUsuario);
    const hasHydrated = usePermissoesStore((state) => state.hasHydrated);
    return {usuario, setUsuario, hasHydrated};
};