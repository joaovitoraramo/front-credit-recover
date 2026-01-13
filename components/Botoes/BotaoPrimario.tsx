"use client";

import {ReactNode} from "react";

interface BotaoPrimarioProps {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
}

export default function BotaoPrimario({
                                          label,
                                          icon,
                                          onClick,
                                          disabled = false,
                                          type = "button",
                                      }: BotaoPrimarioProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                relative w-full
                flex items-center justify-center gap-2
                rounded-2xl
                px-6 py-4
                text-sm font-semibold
                select-none

                transition-all duration-300 ease-out

                ${
                disabled
                    ? `
                            bg-gray-200
                            text-gray-400
                            cursor-not-allowed
                        `
                    : `
                            bg-primary
                            text-white

                            shadow-[0_6px_18px_rgba(0,0,0,0.22)]
                            hover:shadow-[0_12px_30px_rgba(0,0,0,0.32)]

                            hover:-translate-y-[1px]
                            active:translate-y-[1px]
                            active:shadow-[0_6px_18px_rgba(0,0,0,0.20)]
                        `
            }
            `}
        >
            {/* Glow suave */}
            {!disabled && (
                <span
                    className="
                        absolute inset-0
                        rounded-2xl
                        bg-white/10
                        opacity-0
                        transition-opacity duration-300
                        pointer-events-none
                        group-hover:opacity-100
                    "
                />
            )}

            {icon && (
                <span
                    className={`
                        flex items-center
                        transition-transform duration-300 ease-out
                        ${
                        disabled
                            ? ""
                            : "group-hover:-translate-x-0.5"
                    }
                    `}
                >
                    {icon}
                </span>
            )}

            <span className="relative z-10">{label}</span>
        </button>
    );
}
