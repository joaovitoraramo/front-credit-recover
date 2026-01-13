"use client"

import {useEffect, useRef, useState} from "react"
import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {ChevronRight, LucideIcon} from "lucide-react"

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

export interface DrawerDesktopProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    menuItems: MenuItem[]
}

export default function DrawerDesktop({
                                          isOpen,
                                          setIsOpen,
                                          menuItems
                                      }: DrawerDesktopProps) {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
    const router = useRouter()
    const pathname = usePathname()

    const closeTimeout = useRef<NodeJS.Timeout | null>(null)
    const submenuTimeout = useRef<NodeJS.Timeout | null>(null)

    function handleNavigate(href?: string) {
        if (!href) return
        router.push(href)
        setIsOpen(false)
        setActiveSubmenu(null)
    }

    function openSubmenu(label: string) {
        if (submenuTimeout.current) clearTimeout(submenuTimeout.current)

        submenuTimeout.current = setTimeout(() => {
            setActiveSubmenu(label)
        }, 90) // delay de intenção
    }

    function closeAll() {
        if (closeTimeout.current) clearTimeout(closeTimeout.current)
        if (submenuTimeout.current) clearTimeout(submenuTimeout.current)

        closeTimeout.current = setTimeout(() => {
            setIsOpen(false)
            setActiveSubmenu(null)
        }, 220)
    }

    useEffect(() => {
        return () => {
            if (closeTimeout.current) clearTimeout(closeTimeout.current)
            if (submenuTimeout.current) clearTimeout(submenuTimeout.current)
        }
    }, [])

    return (
        <aside
            className={`
                fixed top-0 left-0 h-full z-[40]
                transition-[width] duration-[420ms] ease-[cubic-bezier(.22,.61,.36,1)]
                ${isOpen ? "w-[280px]" : "w-[64px]"}
            `}
            onMouseEnter={() => {
                if (closeTimeout.current) clearTimeout(closeTimeout.current)
                setIsOpen(true)
            }}
            onMouseLeave={closeAll}
        >
            {/* CONTAINER */}
            <div
                className="
                    h-full mt-16 px-3 py-6
                    bg-white dark:bg-black/50
                    backdrop-blur-[14px]
                    border-r border-gray-200 dark:border-white/10
                    shadow-[0_12px_50px_rgba(0,0,0,0.14)]
                    dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)]
                    transition-shadow duration-500
                "
            >
                <nav>
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => {
                            const isActive =
                                item.href && pathname.startsWith(item.href)

                            return (
                                <li key={index}>
                                    {/* ITEM PRINCIPAL */}
                                    <button
                                        onClick={() => handleNavigate(item.href)}
                                        onMouseEnter={() =>
                                            item.subItems &&
                                            openSubmenu(item.label)
                                        }
                                        className={`
                                            group w-full
                                            flex items-center gap-3
                                            px-3 py-3
                                            rounded-xl
                                            transition-all duration-300 ease-out

                                            ${
                                            isActive
                                                ? `
                                                        bg-primary/10 text-primary
                                                        dark:bg-white/15 dark:text-white
                                                      `
                                                : `
                                                        text-gray-700
                                                        hover:bg-gray-100
                                                        dark:text-gray-300
                                                        dark:hover:bg-white/10
                                                      `
                                        }
                                        `}
                                    >
                                        {/* ÍCONE */}
                                        <item.icon
                                            className="
                                                h-5 w-5 min-w-[20px]
                                                transition-transform duration-300 ease-out
                                                group-hover:translate-x-[1px]
                                            "
                                        />

                                        {/* LABEL */}
                                        <span
                                            className={`
                                                text-sm font-medium
                                                whitespace-nowrap
                                                transition-all duration-300 ease-out delay-75
                                                ${
                                                isOpen
                                                    ? "opacity-100 translate-x-0"
                                                    : "opacity-0 -translate-x-3 w-0"
                                            }
                                            `}
                                        >
                                            {item.label}
                                        </span>

                                        {/* SETA */}
                                        {item.subItems && isOpen && (
                                            <ChevronRight
                                                className={`
                                                    ml-auto h-4 w-4
                                                    transition-all duration-300 ease-out
                                                    ${
                                                    activeSubmenu === item.label
                                                        ? "rotate-90 opacity-100"
                                                        : "opacity-50"
                                                }
                                                `}
                                            />
                                        )}
                                    </button>

                                    {/* SUBMENU */}
                                    {item.subItems &&
                                        isOpen &&
                                        activeSubmenu === item.label && (
                                            <ul
                                                className="
                                                    mt-2 ml-4 space-y-1
                                                    origin-top
                                                    animate-[submenuIn_0.28s_ease-out]
                                                "
                                            >
                                                {item.subItems.map(
                                                    (subItem, subIndex) => {
                                                        const subActive =
                                                            pathname === subItem.href

                                                        return (
                                                            <li key={subIndex}>
                                                                <Link
                                                                    href={subItem.href}
                                                                    className={`
                                                                        flex items-center gap-3
                                                                        px-3 py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        transition-all duration-300 ease-out
                                                                        hover:translate-x-[2px]

                                                                        ${
                                                                        subActive
                                                                            ? `
                                                                                    bg-primary/15 text-primary
                                                                                    dark:bg-primary/20
                                                                                  `
                                                                            : `
                                                                                    text-gray-600 hover:bg-gray-100 hover:text-gray-900
                                                                                    dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white
                                                                                  `
                                                                    }
                                                                    `}
                                                                >
                                                                    <subItem.icon className="h-4 w-4" />
                                                                    <span>{subItem.label}</span>
                                                                </Link>
                                                            </li>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        )}
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    )
}
