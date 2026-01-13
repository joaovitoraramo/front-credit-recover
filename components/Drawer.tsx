"use client"

import {
    BarChart2,
    BookOpen,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    CreditCard,
    DollarSign,
    Home,
    ImageIcon as AdquirenteIcon,
    Landmark,
    LayoutDashboard,
    LucideIcon,
    Settings,
    UserPlus,
    Users,
    Users2,
    Wallet,
} from "lucide-react"
import DrawerMobile from "@/components/DrawerMobile";
import DrawerDesktop, {DrawerDesktopProps} from "@/components/DrawerDesktop";
import {usePermissoes} from "@/context/PermissoesContext";

export interface SubMenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    tag: number;
}

export interface MenuItem {
    icon: LucideIcon;
    label: string;
    href?: string;
    subItems?: SubMenuItem[];
    tag: number;
    canMobile: boolean;
}

export default function Drawer({isOpen, setIsOpen}: DrawerDesktopProps) {

    const {usuario} = usePermissoes();

    const permissoes = usuario?.permissoes;

    function isMobile() {
        if (typeof window !== 'undefined') {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            );
        }
        return false;
    }

    const menuItems: MenuItem[] = [
        {
            icon: Home,
            label: "Principal",
            tag: 0,
            canMobile: true,
            subItems: [
                {
                    icon: LayoutDashboard,
                    label: 'Tela principal',
                    href: '/principal',
                    tag: 0
                },
                {
                    icon: ChartNoAxesCombined,
                    label: 'Dashboard',
                    href: '/dashboard',
                    tag: 1001
                }
            ]
        },
        {
            icon: BriefcaseBusiness,
            label: "Processamento",
            tag: 0,
            canMobile: false,
            subItems: [
                {
                    icon: DollarSign,
                    label: "Processamentos",
                    href: "/processamento/processamentos",
                    tag: 1002
                },
                {
                    icon: Wallet,
                    label: "Lotes",
                    href: "/processamento/lotes",
                    tag: 1003
                }
            ]
        },
        {
            icon: BarChart2,
            label: "Cadastros",
            canMobile: false,
            tag: 0,
            subItems: [
                {icon: Users, label: "Clientes", href: "/cadastros/clientes", tag: 1032},
                {icon: BookOpen, label: "Contabilidades", href: "/cadastros/contabilidades", tag: 1028},
                {icon: UserPlus, label: "Sócios", href: "/cadastros/socios", tag: 1024},
                {icon: Landmark, label: "Bancos", href: "/cadastros/bancos", tag: 1020},
                {icon: CreditCard, label: "Bandeiras", href: "/cadastros/bandeiras", tag: 1016},
                {icon: AdquirenteIcon, label: "Adquirentes", href: "/cadastros/adquirentes", tag: 1012},
                {icon: Users, label: "Usuários", href: "/cadastros/usuarios", tag: 1008},
                {icon: Users2, label: "Perfil - Permissões", href: "/cadastros/perfis", tag: 1004},
            ],
        },
        {
            icon: Settings,
            label: "Configurações",
            href: "/perfil",
            canMobile: false,
            tag: 0
        },
    ].filter(item => {
        if (isMobile() && !item.canMobile) {
            return false;
        }
        if (!usuario.isSuporte) {
            const permissaoTags = permissoes.map(p => p.tag);

            if (item.tag && item.tag > 0 && !permissaoTags.includes(item.tag)) {
                return false;
            }

            if (item.subItems) {
                item.subItems = item.subItems.filter(subItem => permissaoTags.includes(subItem.tag));
                return item.subItems.length > 0 || item.href;
            }
        }

        return true;
    });

    return (
        <>
            {isMobile() ? (
                <DrawerMobile isOpen={isOpen} setIsOpen={setIsOpen} menuItems={menuItems}/>
            ) : (
                <DrawerDesktop isOpen={isOpen} setIsOpen={setIsOpen} menuItems={menuItems}/>
            )}
        </>
    );
}