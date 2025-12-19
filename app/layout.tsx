import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LoadingProvider } from '@/context/LoadingContext';
import Loading from '@/components/Loading';
import { ModalAvisoConfirmacaoProvider } from '@/context/ModalAvisoConfirmacaoContext';
import ModalAvisoConfirmacao from '@/components/ModalAvisoConfirmacao';
import Navbar from '@/components/Navbar';
import React from 'react';
import { PermissoesProvider } from '@/context/PermissoesContext';

export const metadata: Metadata = {
    title: 'ConciCredit',
    description: 'Sua plataforma de conciliação de ativos!',
    generator: 'rvlanddevs ltda',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <PermissoesProvider>
                    <LoadingProvider>
                        <ModalAvisoConfirmacaoProvider>
                            <Loading />
                            <ModalAvisoConfirmacao />
                            <Toaster />
                            <Navbar>
                                <main>{children}</main>
                            </Navbar>
                        </ModalAvisoConfirmacaoProvider>
                    </LoadingProvider>
                </PermissoesProvider>
            </body>
        </html>
    );
}
