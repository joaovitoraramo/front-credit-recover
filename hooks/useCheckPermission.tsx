"use client";

import {useRouter} from "next/navigation";
import {usePermissoes} from "@/context/PermissoesContext";
import {useEffect, useState} from "react";

export const useCheckPermission = (
    requiredTag: number,
    page: boolean
): boolean => {
    const router = useRouter();
    const { usuario, hasHydrated } = usePermissoes(); // 👈 IMPORTANTE
    const [hasPermission, setHasPermission] = useState<boolean>(false);

    useEffect(() => {
        // ⏳ enquanto carrega, não valida nada
        if (!hasHydrated) return;

        // 🔐 suporte sempre passa
        if (usuario?.isSuporte) {
            setHasPermission(true);
            return;
        }

        // 🔓 sem tag obrigatória
        if (requiredTag <= 0) {
            setHasPermission(true);
            return;
        }

        // 🚫 usuário não carregado (não autenticado)
        if (!usuario) {
            if (page) router.replace("/acesso-negado");
            setHasPermission(false);
            return;
        }

        const permissaoTags = usuario.permissoes.map(p => p.tag);

        if (!permissaoTags.includes(requiredTag)) {
            if (page) {
                router.replace("/acesso-negado");
            }
            setHasPermission(false);
        } else {
            setHasPermission(true);
        }

    }, [usuario, hasHydrated, requiredTag, page, router]);

    return hasPermission;
};
