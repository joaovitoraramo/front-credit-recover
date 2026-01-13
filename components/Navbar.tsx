'use client';

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Image from 'next/image';
import {LogOut, Menu, Settings, User} from 'lucide-react';
import Drawer from '@/components/Drawer';
import {usePermissoes} from '@/context/PermissoesContext';

export default function Navbar({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const router = useRouter();
    const pathname = usePathname();
    const { usuario } = usePermissoes();

    /* =======================
       THEME INIT
    ======================= */
    useEffect(() => {
        const storedTheme =
            typeof window !== 'undefined'
                ? localStorage.getItem('theme')
                : null;

        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        }
    }, []);

    function toggleTheme() {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        router.push('/');
    }

    if (pathname === '/') {
        return <>{children}</>;
    }

    return (
        <div>
            {/* NAVBAR */}
            <nav className="
                fixed w-full z-50
                bg-white/95 dark:bg-[#0B1220]/95
                backdrop-blur
                border-b border-gray-200 dark:border-white/10
            ">
                <div className="flex justify-between h-16 items-center px-4">

                    {/* ESQUERDA */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => router.push('/dashboard')}
                        >
                            <Image
                                src="/logo_black.svg"
                                alt="Logo CreditRecover"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <span className="text-lg font-bold text-primary">
                                Credit Recover
                            </span>
                        </div>
                    </div>

                    {/* DIREITA */}
                    <div className="flex items-center">
                        <div className="relative group">
                            {/* AVATAR */}
                            <button className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                <div className="h-9 w-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                                    {usuario?.icone ? (
                                        <img
                                            src={usuario.icone}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-primary font-bold">
                                            {usuario?.nome?.charAt(0)?.toUpperCase() ?? (
                                                <User size={16} />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {/* DROPDOWN */}
                            <div
                                className="
                                    absolute right-0 mt-3 w-64
                                    rounded-2xl
                                    bg-white dark:bg-[#0F172A]
                                    shadow-[0_20px_60px_rgba(0,0,0,0.2)]
                                    border border-gray-100 dark:border-white/10
                                    opacity-0 invisible
                                    group-hover:opacity-100 group-hover:visible
                                    translate-y-2 group-hover:translate-y-0
                                    transition-all duration-200
                                "
                            >
                                {/* HEADER */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                        {usuario?.nome}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        Perfil do usuário
                                    </p>
                                </div>

                                {/* AÇÕES */}
                                <div className="p-2 space-y-1">

                                    {/* CONFIG */}
                                    <button
                                        onClick={() => router.push('/perfil')}
                                        className="
                                            w-full flex items-center gap-3
                                            px-3 py-2
                                            rounded-lg
                                            text-sm
                                            text-gray-700 dark:text-gray-200
                                            hover:bg-gray-100 dark:hover:bg-white/10
                                            transition
                                        "
                                    >
                                        <Settings className="h-4 w-4" />
                                        Configurações
                                    </button>

                                    {/* TEMA */}
                                    {/*<div*/}
                                    {/*    className="*/}
                                    {/*        flex items-center justify-between*/}
                                    {/*        px-3 py-2*/}
                                    {/*        rounded-lg*/}
                                    {/*        text-sm*/}
                                    {/*        text-gray-700 dark:text-gray-200*/}
                                    {/*    "*/}
                                    {/*>*/}
                                    {/*    <div className="flex items-center gap-3">*/}
                                    {/*        {theme === 'dark' ? (*/}
                                    {/*            <Moon className="h-4 w-4" />*/}
                                    {/*        ) : (*/}
                                    {/*            <Sun className="h-4 w-4" />*/}
                                    {/*        )}*/}
                                    {/*        Tema escuro*/}
                                    {/*    </div>*/}

                                    {/*    /!* SWITCH *!/*/}
                                    {/*    <button*/}
                                    {/*        onClick={toggleTheme}*/}
                                    {/*        className={`*/}
                                    {/*            relative w-11 h-6 rounded-full*/}
                                    {/*            transition-colors*/}
                                    {/*            ${theme === 'dark'*/}
                                    {/*            ? 'bg-primary'*/}
                                    {/*            : 'bg-gray-300'}*/}
                                    {/*        `}*/}
                                    {/*    >*/}
                                    {/*        <span*/}
                                    {/*            className={`*/}
                                    {/*                absolute top-0.5 left-0.5*/}
                                    {/*                h-5 w-5 rounded-full bg-white*/}
                                    {/*                transition-transform*/}
                                    {/*                ${theme === 'dark'*/}
                                    {/*                ? 'translate-x-5'*/}
                                    {/*                : ''}*/}
                                    {/*            `}*/}
                                    {/*        />*/}
                                    {/*    </button>*/}
                                    {/*</div>*/}

                                    {/* LOGOUT */}
                                    <button
                                        onClick={handleLogout}
                                        className="
                                            w-full flex items-center gap-3
                                            px-3 py-2
                                            rounded-lg
                                            text-sm text-red-600
                                            hover:bg-red-50 dark:hover:bg-red-500/10
                                            transition
                                        "
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* DRAWER */}
            <Drawer isOpen={isOpen} setIsOpen={setIsOpen} menuItems={[]} />

            {/* CONTEÚDO */}
            <div className="pt-16">{children}</div>
        </div>
    );
}
