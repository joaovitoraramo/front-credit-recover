"use client";

import {useRouter} from 'next/navigation';
import {usePermissoes} from '@/context/PermissoesContext';
import {useEffect, useState} from 'react';

export const useCheckPermission = (requiredTag: number, page: boolean): boolean => {
    const router = useRouter();
    const {usuario} = usePermissoes();
    const [hasPermission, setHasPermission] = useState<boolean>(true);

    useEffect(() => {

        if (usuario) {
            if (usuario.isSuporte) {
                setHasPermission(true);
                return;
            }

            if (requiredTag > 0) {
                const permissaoTags = usuario.permissoes.map(p => p.tag);
                if (!permissaoTags.includes(requiredTag)) {
                    if (page) {
                        router.push('/acesso-negado');
                    } else {
                        setHasPermission(false);
                    }
                } else {
                    setHasPermission(true);
                }
            } else {
                setHasPermission(true);
            }
        } else {
            setHasPermission(true);
        }
    }, [usuario, requiredTag, router, page]);

    return hasPermission;
};