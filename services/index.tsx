// services/index.tsx

'use client';

export const getPadrao = async (uri: string) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    try {
        const response = await fetch(uri, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`,
            );
        }

        if (response.status === 401) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        if (!token) {
            throw new Error('Token JWT não encontrado no header.');
        }

        return await response.json();
    } catch (err: any) {
        console.log(err);
    }
};

export const getResponsePadrao = async (uri: string) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    try {
        const response = await fetch(uri, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`,
            );
        }

        if (response.status === 401) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        if (!token) {
            throw new Error('Token JWT não encontrado no header.');
        }

        return await response;
    } catch (err: any) {
        console.log(err);
    }
};

export const postPadrao = async (uri: string, objeto?: any | any[]) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(objeto),
        });

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

        return await response.json();
    } catch (err: any) {
        console.log(err);
    }
};

export const postArquivo = async (uri: string, objeto: any) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: objeto,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`,
            );
        }

        if (response.status === 401) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        return await response.json();
    } catch (err: any) {
        console.log(err);
        throw err;
    }
};

export const putPadrao = async (uri: string, objeto: any | any[]) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    try {
        const response = await fetch(uri, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(objeto),
        });

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

        return await response.json();
    } catch (err: any) {
        console.log(err);
    }
};

export const deletaPadrao = async (uri: string) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    try {
        const response = await fetch(uri, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

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

        return await response.json();
    } catch (err: any) {
        console.log(err);
    }
};
