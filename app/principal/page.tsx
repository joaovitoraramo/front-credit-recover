'use client';

import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {BarChart2, CreditCard, DollarSign, Users, Wallet,} from 'lucide-react';
import {usePermissoes} from '@/context/PermissoesContext';

interface Atalho {
    label: string;
    descricao: string;
    href: string;
    icon: any;
    tag: number;
}

export default function PaginaInicial() {
    const router = useRouter();
    const { usuario } = usePermissoes();

    const permissoes = usuario?.permissoes?.map(p => p.tag) ?? [];

    const atalhos: Atalho[] = [
        {
            label: 'Clientes',
            descricao: 'Gerencie cadastros e status',
            href: '/cadastros/clientes',
            icon: Users,
            tag: 1032,
        },
        {
            label: 'Processamento de Vendas',
            descricao: 'Acompanhe processamentos financeiros',
            href: '/processamento/processamentos',
            icon: DollarSign,
            tag: 1002,
        },
        {
            label: 'Lotes de Recebiveis',
            descricao: 'Gestão de lotes e pagamentos',
            href: '/processamento/lotes',
            icon: Wallet,
            tag: 1003,
        },
        {
            label: 'Dashboard de Vendas',
            descricao: 'Indicadores e análises de vendas',
            href: '/dashboard/vendas',
            icon: BarChart2,
            tag: 1001,
        },
        {
            label: 'Dashboard de Recebimentos',
            descricao: 'Indicadores e análises de recebimentos',
            href: '/dashboard/recebimentos',
            icon: BarChart2,
            tag: 1001,
        },
        {
            label: 'Bandeiras',
            descricao: 'Gerencie as bandeiras e configurações de cartões',
            href: '/cadastros/bandeiras',
            icon: CreditCard,
            tag: 1016,
        },
        {
            label: 'Usuários',
            descricao: 'Gerencie usuários, acessos e permissões',
            href: '/cadastros/usuarios',
            icon: Users,
            tag: 1008,
        },
        // {
        //     label: 'Configurações',
        //     descricao: 'Preferências e permissões',
        //     href: '/configuracoes',
        //     icon: Settings,
        //     tag: 0,
        // },
    ].filter(item =>
        usuario?.isSuporte || item.tag === 0 || permissoes.includes(item.tag)
    );

    return (
        <div className="min-h-screen pl-[64px] w-full bg-gradient-to-br from-[#0F172A] via-[#020617] to-black relative overflow-hidden">

            {/* Ambient lights */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px]" />

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">

                {/* HEADER */}
                <div className="text-center mb-16 animate-[fadeIn_0.6s_ease-out]">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo_black.svg"
                            alt="Logo ConciCredit"
                            width={160}
                            height={160}
                            className="drop-shadow-xl"
                        />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                        Bem-vindo ao ConciCredit
                    </h1>

                    <p className="mt-4 text-white/70 max-w-xl mx-auto text-sm md:text-base">
                        Utilize os atalhos abaixo para acessar rapidamente as principais áreas do sistema.
                    </p>
                </div>

                {/* ATALHOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.8s_ease-out]">

                    {atalhos.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className="
                                    text-left group
                                    rounded-2xl
                                    bg-white/95 backdrop-blur-xl
                                    p-6
                                    shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                                    transition-all duration-300
                                    hover:-translate-y-2
                                    hover:shadow-[0_30px_80px_rgba(0,0,0,0.55)]
                                "
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition">
                                        →
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900">
                                    {item.label}
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    {item.descricao}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
