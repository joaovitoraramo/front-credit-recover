"use client"

import {useRouter} from 'next/navigation';
import BotaoPadrao from "@/components/Botoes/BotaoPadrao";
import {Home} from "lucide-react";

export default function AcessoNegadoPage() {
    const router = useRouter();

    const versao = process.env.NEXT_PUBLIC_APP_VERSION;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-4xl font-bold text-primary mb-8">
                    Acesso Restrito
                </h1>

                <div className="p-8 rounded-lg shadow-md border border-gray-200">
                    <p className="text-xl mb-6 text-gray-800">
                        Hum... parece que você tropeçou em uma área onde não deveria estar.
                    </p>
                    <p className="text-lg mb-6 text-gray-700">
                        Sabe aquele ditado, "a curiosidade matou o gato"? Então...
                    </p>
                    <p className="text-sm text-gray-600 mb-8">
                        (Mas relaxa, você ainda tem várias vidas aqui. Que tal voltar para a página inicial?)
                    </p>
                    <BotaoPadrao
                        variant='outline'
                        name='Voltar para a Página Inicial'
                        icon={<Home className='w-5 h-5'/>}
                        onClick={() => router.push('/principal')}
                    />
                    <div>
                        <p className="text-sm text-gray-600 mb-8">
                            Versão: {versao}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}