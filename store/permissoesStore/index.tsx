'use client';

// store/permissoesStore.ts
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {IPermissao} from '@/types/perfil';

export interface IUsuario {
    nome: string;
    email: string;
    icone: string;
    perfil: IPerfilUsuario;
    permissoes: IPermissao[];
    token: string;
    isSuporte: boolean;
}

interface IPerfilUsuario {
    id: number;
    nome: string;
    email: string;
}

interface PermissoesState {
    usuario: IUsuario | null;
    setUsuario: (usuario: IUsuario) => void;
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
}

export const usePermissoesStore = create<PermissoesState>()(
    persist(
        (set) => ({
            usuario: {
                id: 0,
                nome: '',
                email: '',
                icone: '',
                perfil: {
                    id: 0,
                    nome: '',
                    email: '',
                },
                permissoes: [],
                token: '',
                isSuporte: false,
            },
            setUsuario: (usuario) => set({ usuario }),
            hasHydrated: false,
            setHasHydrated: (value) => set({ hasHydrated: value })
        }),
        {
            name: 'permissoes-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
