"use client"

import {useState} from "react"
import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {ChevronDown, LucideIcon} from "lucide-react"

export interface SubMenuItem {
    icon: LucideIcon
    label: string
    href: string
}

export interface MenuItem {
    icon: LucideIcon
    label: string
    href?: string
    subItems?: SubMenuItem[]
}

export interface DrawerMobileProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    menuItems: MenuItem[]
}

export default function DrawerMobile({
                                         isOpen,
                                         setIsOpen,
                                         menuItems,
                                     }: DrawerMobileProps) {
    const router = useRouter()
    const pathname = usePathname()

    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

    function handleNavigate(href?: string) {
        if (!href) return
        router.push(href)
        setIsOpen(false)
        setOpenSubmenu(null)
    }

    function toggleSubmenu(label: string) {
        setOpenSubmenu(prev => (prev === label ? null : label))
    }

    return (
        <>
            {/* OVERLAY */}
            <div
                className={`
                    fixed inset-0 z-[45]
                    bg-black/40
                    backdrop-blur-sm
                    transition-opacity duration-300
                    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
                `}
                onClick={() => setIsOpen(false)}
            />

            {/* DRAWER */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-[50]
                    w-[78%] max-w-[320px]
                    transition-transform duration-400
                    ease-[cubic-bezier(.22,.61,.36,1)]
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div
                    className="
                        h-full pt-20 px-4 pb-6
                        bg-white/80
                        backdrop-blur-xl
                        border-r border-gray-200
                        shadow-[0_20px_80px_rgba(0,0,0,0.25)]
                    "
                >
                    <nav>
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => {
                                const isActive =
                                    item.href &&
                                    pathname.startsWith(item.href)

                                const submenuOpen =
                                    openSubmenu === item.label

                                return (
                                    <li key={index}>
                                        {/* ITEM PRINCIPAL */}
                                        <button
                                            onClick={() =>
                                                item.subItems
                                                    ? toggleSubmenu(item.label)
                                                    : handleNavigate(item.href)
                                            }
                                            className={`
                                                w-full flex items-center gap-3
                                                px-3 py-3
                                                rounded-xl
                                                transition-all duration-300 ease-out

                                                ${
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }
                                            `}
                                        >
                                            <item.icon className="h-5 w-5" />

                                            <span className="text-sm font-medium">
                                                {item.label}
                                            </span>

                                            {item.subItems && (
                                                <ChevronDown
                                                    className={`
                                                        ml-auto h-4 w-4
                                                        transition-transform duration-300
                                                        ${
                                                        submenuOpen
                                                            ? "rotate-180 opacity-100"
                                                            : "opacity-50"
                                                    }
                                                    `}
                                                />
                                            )}
                                        </button>

                                        {/* SUBMENU */}
                                        {item.subItems && (
                                            <div
                                                className={`
                                                    overflow-hidden
                                                    transition-all duration-300 ease-out
                                                    ${
                                                    submenuOpen
                                                        ? "max-h-[500px] opacity-100"
                                                        : "max-h-0 opacity-0"
                                                }
                                                `}
                                            >
                                                <ul className="mt-2 ml-4 space-y-1">
                                                    {item.subItems.map(
                                                        (subItem, subIndex) => {
                                                            const subActive =
                                                                pathname ===
                                                                subItem.href

                                                            return (
                                                                <li key={subIndex}>
                                                                    <Link
                                                                        href={
                                                                            subItem.href
                                                                        }
                                                                        onClick={() =>
                                                                            setIsOpen(false)
                                                                        }
                                                                        className={`
                                                                            flex items-center gap-3
                                                                            px-3 py-2
                                                                            rounded-lg
                                                                            text-sm
                                                                            transition-all duration-300 ease-out

                                                                            ${
                                                                            subActive
                                                                                ? "bg-primary/15 text-primary"
                                                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                                        }
                                                                        `}
                                                                    >
                                                                        <subItem.icon className="h-4 w-4" />
                                                                        <span>
                                                                            {
                                                                                subItem.label
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        }
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    )
}
