'use client';

// store/permissoesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IPermissao } from '@/types/perfil';

export interface IUsuario {
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
    usuario: IUsuario;
    setUsuario: (usuario: IUsuario) => void;
}

export const usePermissoesStore = create<PermissoesState>()(
    persist(
        (set) => ({
            usuario: {
                permissoes: [],
                perfil: {
                    nome: '',
                    email: '',
                    id: -1,
                },
                token: '',
                isSuporte: false,
            },
            setUsuario: (usuario) => set({ usuario }),
        }),
        {
            name: 'permissoes-storage',
        },
    ),
);
