'use client';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import { Menu } from 'lucide-react';
import Drawer from '@/components/Drawer';
import { ReactNode, useState } from 'react';

export default function Navbar({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname(); // Obtenha a rota atual

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        router.push('/');
    };

    return pathname === '/' ? (
        <>{children}</>
    ) : (
        <div>
            <nav className="fixed w-full bg-white shadow-md z-50">
                <div>
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-700 hover:text-primary transition-colors duration-200 mr-4 ml-4"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex-shrink-0 flex items-center">
                                <Image
                                    src="/logo_black.svg"
                                    alt="Logo CreditRecover"
                                    width={64}
                                    height={64}
                                    className="rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
                                />
                                <span className="text-xl ml-2 font-bold text-primary">
                                    Credit Recover
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="relative pr-4 group">
                                <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
                                    <Image
                                        className="h-8 w-8 rounded-full"
                                        src="/person_circle.svg"
                                        alt="User avatar"
                                        width={32}
                                        height={32}
                                    />
                                </button>
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                                    <div className="py-1 rounded-md bg-white shadow-xs">
                                        <BotaoPadrao
                                            onClick={handleLogout}
                                            variant="ghost"
                                            transparent
                                            name="Sair"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <Drawer isOpen={isOpen} setIsOpen={setIsOpen} menuItems={[]} />
            <div className="pt-16">{children}</div>
        </div>
    );
}
