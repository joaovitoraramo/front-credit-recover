'use client';

import {FormEvent, useEffect, useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {IMensagemPadraoProps,} from '@/components/Util/MensagemPadrao';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';
import {Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail} from 'lucide-react';
import CheckBoxPadrao from '@/components/Botoes/CheckBoxPadrao';
import {autenticar} from '@/services/Usuario';
import {useLoading} from '@/context/LoadingContext';
import {usePermissoes} from '@/context/PermissoesContext';
import {useToast} from "@/components/toast/ToastProvider";

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
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);


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

    useEffect(() => {
        if (!message) return;

        const tipoMap = {
            info: "success",
            erro: "error",
            aviso: "warning",
        } as const;

        const tipo =
            tipoMap[message.tipo as keyof typeof tipoMap] ?? "success";

        showToast(message.mensagem, tipo);

        setMessage(undefined);
    }, [message, showToast]);

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
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#020617] to-black relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px]" />

            {/* Card */}
            <div
                className="
                relative z-10
                w-full max-w-5xl
                bg-white/95 backdrop-blur-xl
                rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)]
                grid grid-cols-1 lg:grid-cols-2
                overflow-hidden
                animate-[fadeIn_0.6s_ease-out]
            "
            >

                {/* LEFT — BRAND / IMAGE */}
                <div className="hidden lg:flex relative items-center justify-center bg-primary p-10">
                    {/* Image Frame */}
                    <div
                        className="
            relative w-full h-full
            rounded-3xl overflow-hidden
            shadow-[0_30px_80px_rgba(0,0,0,0.35)]
            bg-white/5
            backdrop-blur-sm
        "
                    >
                        <Image
                            src="/sigin.svg"
                            alt="Ilustração Login"
                            fill
                            priority
                            className="
                object-cover
                transition-transform duration-700
                hover:scale-[1.03]
            "
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                        {/* Text */}
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <h2 className="text-3xl font-bold leading-tight">
                                Controle total.<br />Decisões inteligentes.
                            </h2>
                            <p className="mt-3 text-white/80 text-sm max-w-sm">
                                Acesse sua plataforma de conciliação com segurança,
                                performance e clareza.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT — LOGIN */}
                <div className="flex flex-col justify-center px-8 py-12 sm:px-14">

                    {/* Logo */}
                    <div className="flex justify-center mb-10">
                        <Image
                            src="/logo_black.svg"
                            alt="Logo CreditRecover"
                            width={140}
                            height={140}
                            className="drop-shadow-md"
                        />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            Acesse sua conta
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Entre com suas credenciais para continuar
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* EMAIL */}
                        <div className="relative group">
                            {/* Ícone */}
                            <Mail
                                className="
                                    absolute left-4 top-1/2 -translate-y-1/2
                                    h-4 w-4
                                    text-gray-400
                                    transition-colors
                                    group-focus-within:text-primary
                                "
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                required
                                className="
                                    peer w-full rounded-xl
                                    border border-gray-300
                                    bg-transparent
                                    pl-11 pr-4 pt-6 pb-3 text-sm
                                    outline-none
                                    focus:border-primary
                                    focus:ring-4 focus:ring-primary/20
                                    transition-all
                                "
                            />

                            <label
                                className={`
                                    absolute left-11 top-1/2 -translate-y-1/2
                                    origin-left
                                    pointer-events-none
                                    text-sm text-gray-400
                                    transition-all duration-300 ease-out
                                    ${
                                                            emailFocused || email
                                                                ? "scale-75 -translate-y-[1.75rem] text-primary"
                                                                : ""
                                                        }
                                `}
                            >
                                Email
                            </label>
                        </div>


                        {/* PASSWORD */}
                        <div className="relative group">
                            {/* Ícone */}
                            <Lock
                                className="
                                    absolute left-4 top-1/2 -translate-y-1/2
                                    h-4 w-4
                                    text-gray-400
                                    transition-colors
                                    group-focus-within:text-primary
                                "
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                required
                                className="
                                    peer w-full rounded-xl
                                    border border-gray-300
                                    bg-transparent
                                    pl-11 pr-12 pt-6 pb-3 text-sm
                                    outline-none
                                    focus:border-primary
                                    focus:ring-4 focus:ring-primary/20
                                    transition-all
                                "
                            />

                            <label
                                className={`
                                    absolute left-11 top-1/2 -translate-y-1/2
                                    origin-left
                                    pointer-events-none
                                    text-sm text-gray-400
                                    transition-all duration-300 ease-out
                                    ${
                                                            passwordFocused || senha
                                                                ? "scale-75 -translate-y-[1.75rem] text-primary"
                                                                : ""
                                                        }
                                `}
                            >
                                Senha
                            </label>

                            {/* Mostrar / ocultar */}
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="
                                    absolute right-4 top-1/2 -translate-y-1/2
                                    text-gray-400
                                    hover:text-primary
                                    transition-colors
                                "
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>



                        {/* REMEMBER */}
                        <div className="flex items-center gap-2">
                            <CheckBoxPadrao
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <span className="text-sm text-gray-700">
                            Lembrar meu acesso
                        </span>
                        </div>

                        {/* BUTTON */}
                        <BotaoPadrao
                            onClick={handleSubmit}
                            disabled={isLoading}
                            name={isLoading ? "Entrando..." : "Entrar"}
                            icon={
                                isLoading ? (
                                    <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <LogIn className="h-5 w-5 mr-2" />
                                )
                            }
                            className="
                            w-full py-4 text-base
                            transition-all duration-300
                            hover:-translate-y-[2px]
                            hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                        "
                            variant="outline"
                        />
                    </form>
                </div>
            </div>
        </div>
    );

}
