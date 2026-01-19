"use client";

import {useRouter} from "next/navigation";
import {Home, ShieldAlert} from "lucide-react";
import BotaoPrimario from "@/components/Botoes/BotaoPrimario";

export default function AcessoNegadoPage() {
    const router = useRouter();
    const versao = process.env.NEXT_PUBLIC_APP_VERSION;

    return (
        <div
            className="
                min-h-screen w-full
                flex items-center justify-center
                bg-gradient-to-br from-[#0F172A] via-[#020617] to-black
                px-6
            "
        >
            {/* CARD */}
            <div
                className="
                    relative w-full max-w-lg
                    bg-white/95 backdrop-blur-xl
                    rounded-3xl
                    shadow-[0_40px_120px_rgba(0,0,0,0.45)]
                    p-10
                    text-center
                    animate-[fadeInUp_0.6s_ease-out]
                "
            >
                {/* ÍCONE */}
                <div
                    className="
                        mx-auto mb-6
                        h-16 w-16
                        rounded-2xl
                        bg-red-500/10
                        flex items-center justify-center
                        text-red-600
                        shadow-inner
                    "
                >
                    <ShieldAlert className="h-8 w-8" />
                </div>

                {/* TÍTULO */}
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Acesso restrito
                </h1>

                {/* TEXTO */}
                <p className="mt-4 text-gray-700 text-base leading-relaxed">
                    Parece que você tentou acessar uma área que não faz parte das
                    suas permissões atuais.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                    Se acredita que isso é um engano, entre em contato com o
                    administrador do sistema.
                </p>

                {/* AÇÃO */}
                <div className="mt-8">
                    <BotaoPrimario
                        label="Voltar para a página inicial"
                        icon={<Home className="h-5 w-5" />}
                        onClick={() => router.push("/principal")}
                    />
                </div>

                {/* BADGE DE VERSÃO */}
                {versao && (
                    <div
                        className="
                            absolute -bottom-4 left-1/2 -translate-x-1/2
                            px-4 py-1.5
                            rounded-full
                            bg-gray-100
                            text-xs text-gray-500
                            shadow
                        "
                    >
                        Versão {versao}
                    </div>
                )}
            </div>
        </div>
    );
}
