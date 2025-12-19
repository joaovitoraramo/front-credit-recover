"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
    Home,
    DollarSign,
    BarChart2,
    Settings,
    Menu,
    ChevronRight,
    Users,
    BookOpen,
    UserPlus,
    Landmark,
    CreditCard,
    BriefcaseBusiness,
    Wallet,
    ImageIcon as AdquirenteIcon,
} from "lucide-react";
import {IDrawerProps} from "@/components/DrawerDesktop";

export default function DrawerMobile({isOpen, setIsOpen, menuItems}: IDrawerProps) {
    const router = useRouter();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isCadastrosExpanded, setIsCadastrosExpanded] = useState<boolean>(false);
    const [isProcessamentoExpanded, setIsProcessamentoExpanded] = useState<boolean>(false);

    const handleMenuItemClick = (item: any) => {
        if (item.subItems) {
            if (item.label === "Cadastros") {
                setIsCadastrosExpanded(!isCadastrosExpanded);
            } else if (item.label === "Processamento") {
                setIsProcessamentoExpanded(!isProcessamentoExpanded);
            } else {
                setOpenSubmenu(openSubmenu === item.label ? null : item.label);
            }
        }
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-20 w-64 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <nav className="mt-16 p-4">
                    <ul className="space-y-6">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <div
                                    className="flex items-center text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer"
                                    onClick={() => {
                                        if (item.href) {
                                            router.push(item.href);
                                        }
                                        handleMenuItemClick(item);
                                    }}
                                >
                                    <item.icon className="h-6 w-6 min-w-[24px]"/>
                                    <span className="ml-4">{item.label}</span>
                                    {item.subItems && (
                                        <ChevronRight
                                            className={`ml-auto h-4 w-4 transition-transform duration-200 ease-in-out ${
                                                openSubmenu === item.label || (isCadastrosExpanded && item.label === "Cadastros") || (isProcessamentoExpanded && item.label === "Processamento")
                                                    ? "transform rotate-90"
                                                    : ""
                                            }`}
                                        />
                                    )}
                                </div>
                                {item.subItems &&
                                    (openSubmenu === item.label || (isCadastrosExpanded && item.label === "Cadastros") || (isProcessamentoExpanded && item.label === "Processamento")) && (
                                        <ul className="ml-8 mt-2 space-y-2">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <li key={subIndex}>
                                                    <Link
                                                        href={subItem.href}
                                                        className="flex items-center text-gray-600 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
                                                    >
                                                        {subItem.icon && <subItem.icon className="h-4 w-4 mr-2"/>}
                                                        <span className="text-sm">{subItem.label}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
                    isOpen ? "opacity-50 z-10" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            ></div>
        </>
    );
}