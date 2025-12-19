'use client';

import Image from 'next/image';

export default function PaginaInicial() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <div className="bg-primary text-white p-8 rounded-lg shadow-md max-w-lg transition-shadow duration-300 hover:shadow-md hover:shadow-primary">
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/logo_black.svg"
                            alt="Logo"
                            width={256}
                            height={256}
                        />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">
                        Bem-vindo ao ConciCredit!
                    </h1>
                    <p className="text-lg mb-6">Navegue para onde quiser.</p>
                </div>
            </main>
        </div>
    );
}
