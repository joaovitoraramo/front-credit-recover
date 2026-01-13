"use client";

import {useLoading} from "@/context/LoadingContext";

export default function Loading() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Loader Container */}
            <div className="relative z-10 flex flex-col items-center gap-6">

                {/* Orbital Loader */}
                <div className="relative w-24 h-24">

                    {/* Outer ring */}
                    <div
                        className="
                            absolute inset-0
                            rounded-full
                            border border-primary/20
                        "
                    />

                    {/* Spinning arc */}
                    <div
                        className="
                            absolute inset-0
                            rounded-full
                            border-4 border-transparent
                            border-t-primary
                            animate-spin
                        "
                    />

                    {/* Inner pulse */}
                    <div
                        className="
                            absolute inset-4
                            rounded-full
                            bg-primary/20
                            animate-pulse
                        "
                    />
                </div>

                {/* Text */}
                <div className="text-center">
                    <p className="text-sm text-white/80 tracking-wide">
                        Processando
                    </p>
                    <p className="text-xs text-white/40">
                        Aguarde um instante
                    </p>
                </div>
            </div>
        </div>
    );
}
