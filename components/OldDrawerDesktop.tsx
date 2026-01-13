"use client"

import {useState, useEffect, useRef} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {LucideIcon, ChevronRight, Menu} from "lucide-react"

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

export default function DrawerDesktop({isOpen, setIsOpen, menuItems}: DrawerDesktopProps) {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.href) {
            router.push(item.href)
        }
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <div
            className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-[20] ${isOpen ? "min-w-[250px] max-w-full" : "w-14"
            }`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => {
                setIsOpen(false)
                setActiveSubmenu(null)
            }}
        >
            <nav className="mt-16 p-4">
                <ul className="space-y-6">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <div
                                className="flex items-center text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer"
                                onClick={() => handleMenuItemClick(item)}
                                onMouseEnter={() => item.subItems && setActiveSubmenu(item.label)}
                            >
                                <item.icon className="h-6 w-6 min-w-[24px]"/>
                                <span
                                    className={`ml-4 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"} overflow-hidden transition-all duration-200`}>
                                    {item.label}
                                </span>
                                {item.subItems && (
                                    <ChevronRight
                                        className={`ml-auto h-4 w-4 transition-transform duration-200 ease-in-out ${activeSubmenu === item.label ? "transform rotate-90" : ""}`}/>
                                )}
                            </div>
                            {item.subItems && isOpen && activeSubmenu === item.label && (
                                <ul className="ml-8 mt-2 space-y-2">
                                    {item.subItems.map((subItem, subIndex) => (
                                        <li key={subIndex} className="transition-all duration-300">
                                            <Link href={subItem.href}
                                                  className="flex items-center text-gray-600 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105">
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
    )
}