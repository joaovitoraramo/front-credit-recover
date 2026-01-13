'use client';

import {IMensagemPadraoProps} from '@/components/Util/MensagemPadrao';
import {Dispatch, SetStateAction} from 'react';
import {UsuarioDTO} from '@/types/usuario';
import {getPadrao, postPadrao, putPadrao} from '@/services';
import {IUsuario} from '@/store/permissoesStore';

export async function autenticar(
    email: string,
    senha: string,
    setMessage: Dispatch<SetStateAction<IMensagemPadraoProps | undefined>>,
) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json(); // Tenta obter detalhes do erro da API
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`,
            ); // Lança o erro com mensagem detalhada
        }

        if (response.status === 401) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const token = response.headers
            .get('Authorization')
            ?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Token JWT não encontrado no header.');
        }

        const resposta = await response.json();

        const usuario: IUsuario = {
            icone: resposta.icone,
            nome: resposta.nome,
            email: resposta.email,
            perfil: {
                nome: resposta.Nome,
                email,
                id: resposta.Id,
            },
            permissoes: resposta.permissoes,
            isSuporte: resposta.isSuporte,
            token,
        };

        return usuario;
    } catch (err: any) {
        setMessage({
            tipo: 'aviso',
            mensagem: err.message,
        });
    }
}

export async function cadastraUsuario(usuario: Partial<UsuarioDTO>) {
    return await postPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/usuario`,
        usuario,
    );
}

export async function atualizaUsuario(usuario: Partial<UsuarioDTO>) {
    return await putPadrao(
        `${process.env.NEXT_PUBLIC_API_URL}/usuario/${usuario.id}`,
        usuario,
    );
}

export async function getListaUsuarios(filtro: any | null) {
    let uri = `${process.env.NEXT_PUBLIC_API_URL}/usuario`;

    for (const key in filtro) {
        if (filtro.hasOwnProperty(key)) {
            const value = filtro[key];
            uri = `${process.env.NEXT_PUBLIC_API_URL}/usuario?${key}=${value}`;
        }
    }

    return await getPadrao(uri);
}
