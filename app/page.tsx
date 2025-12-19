'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MensagemPadrao, {
    IMensagemPadraoProps,
} from '@/components/Util/MensagemPadrao';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import { LoaderCircle, LogIn } from 'lucide-react';
import TituloPadrao from '@/components/Titulos/TituloPadrao';
import CheckBoxPadrao from '@/components/Botoes/CheckBoxPadrao';
import { autenticar } from '@/services/Usuario';
import { useLoading } from '@/context/LoadingContext';
import { usePermissoes } from '@/context/PermissoesContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const router = useRouter();
    const [message, setMessage] = useState<IMensagemPadraoProps>();
    const { isLoading, setIsLoading } = useLoading();
    const { setUsuario } = usePermissoes();

    useEffect(() => {
        let savedEmail;
        if (typeof window !== 'undefined') {
            savedEmail = localStorage.getItem('rememberedEmail');
        }
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        setIsLoading(true);
        e.preventDefault();

        if (rememberMe) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('rememberedEmail', email);
            }
        } else {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('rememberedEmail');
            }
        }
        const usuario = await autenticar(email, senha, setMessage);

        setIsLoading(false);

        if (usuario && usuario.token) {
            setUsuario(usuario);
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', usuario.token);
                localStorage.setItem('userEmail', email);
            }
            router.push('/principal');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="hidden lg:flex lg:w-2/3 bg-primary items-center justify-center">
                <Image
                    src="/sigin.svg"
                    alt="Sign In Art"
                    width={2000}
                    height={2000}
                    className="max-w-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
                />
            </div>
            <div className="w-full lg:w-1/3 flex items-center justify-center p-8 lg:px-4">
                <div className="max-w-md w-full space-y-6">
                    <div className="flex justify-center">
                        <Image
                            src="/logo_black.svg"
                            alt="Logo CreditRecover"
                            width={150}
                            height={150}
                            className="rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
                        />
                    </div>
                    <div>
                        <TituloPadrao
                            tamanho="h2"
                            titulo="Faça login na sua conta"
                            className="mt-2 text-center text-2xl font-extrabold sm:text-2xl"
                        />
                    </div>
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="relative">
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 border-b-0 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                />
                                <label
                                    htmlFor="email-address"
                                    className={`absolute left-3 transition-all duration-300 ${
                                        emailFocused || email
                                            ? '-top-6 text-xs text-primary'
                                            : 'top-2 text-gray-500'
                                    }`}
                                >
                                    Email
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="password"
                                    className={`absolute left-3 transition-all duration-300 ${
                                        passwordFocused || senha
                                            ? 'top-[6] text-xs text-primary'
                                            : 'top-2 text-gray-500'
                                    }`}
                                >
                                    Senha
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckBoxPadrao
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(!rememberMe)}
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Lembrar
                                </label>
                            </div>
                        </div>

                        <div>
                            <BotaoPadrao
                                onClick={handleSubmit}
                                variant="outline"
                                name="Entrar"
                                icon={
                                    isLoading ? (
                                        <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <LogIn className="h-5 w-5 mr-2" />
                                    )
                                }
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>

                        {message && (
                            <div>
                                <MensagemPadrao
                                    mensagem={message.mensagem}
                                    tipo={message.tipo}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
