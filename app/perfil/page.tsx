"use client";

import {useEffect, useRef, useState} from "react";
import {Camera, Eye, EyeOff, Lock, Save, User} from "lucide-react";
import {usePermissoes} from "@/context/PermissoesContext";
import {useToast} from "@/components/toast/ToastProvider";
import {useLoading} from "@/context/LoadingContext";
import BotaoPrimario from "@/components/Botoes/BotaoPrimario";
import {putPadrao} from "@/services";

export default function PerfilPage() {
    const { usuario } = usePermissoes();
    if (!usuario) return null;
    const { showToast } = useToast();
    const { setIsLoading } = useLoading();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [nome, setNome] = useState(usuario?.nome ?? "");
    const [icone, setIcone] = useState<string | null>(usuario?.icone ?? null);

    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [nomeFocused, setNomeFocused] = useState(false);
    const [senhaFocused, setSenhaFocused] = useState(false);
    const [confirmarFocused, setConfirmarFocused] = useState(false);

    useEffect(() => {
        if (usuario) {
            setNome(usuario.nome ?? "");
            setIcone(usuario.icone ?? null);
        }
    }, [usuario]);

    /* =======================
       REGRAS DE SENHA
    ======================= */
    const senhaRegras = [
        { label: "Mínimo de 8 caracteres", test: (v: string) => v.length >= 8 },
        { label: "Letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
        { label: "Letra minúscula", test: (v: string) => /[a-z]/.test(v) },
        { label: "Número", test: (v: string) => /\d/.test(v) },
        { label: "Caractere especial", test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
    ];

    const senhaPreenchida = senha.length > 0;
    const senhaValida = senhaRegras.every(r => r.test(senha));
    const confirmacaoOk = confirmarSenha.length > 0 && senha === confirmarSenha;

    const podeSalvar =
        nome.trim().length > 0 &&
        (!senhaPreenchida || (senhaValida && confirmacaoOk));

    const regrasAtendidas = senhaRegras.filter(r => r.test(senha)).length;
    const forcaPercentual = (regrasAtendidas / senhaRegras.length) * 100;

    const forcaCor =
        forcaPercentual < 40
            ? "bg-red-400"
            : forcaPercentual < 80
                ? "bg-amber-400"
                : "bg-emerald-500";

    /* =======================
       UPLOAD AVATAR
    ======================= */
    async function handleUploadAvatar(file: File) {
        if (!file.type.startsWith("image/")) {
            showToast("Selecione uma imagem válida.", "warning");
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            showToast("Imagem deve ter no máximo 3MB.", "warning");
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload-avatar", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erro ao enviar avatar");
            }

            const { url } = await response.json();
            setIcone(url);

            showToast("Avatar atualizado.", "success");
        } catch (error) {
            console.error(error);
            showToast("Erro ao atualizar avatar.", "error");
        } finally {
            setIsLoading(false);
        }
    }

    /* =======================
       SALVAR PERFIL
    ======================= */
    async function salvarPerfil() {
        try {
            setIsLoading(true);

            const payload: any = {
                nome: nome.trim(),
            };

            if (icone) payload.icone = icone;
            if (senhaPreenchida) payload.senha = senha;

            await putPadrao(
                `${process.env.NEXT_PUBLIC_API_URL}/usuario/me`,
                payload
            );

            showToast("Perfil atualizado com sucesso.", "success");

            setSenha("");
            setConfirmarSenha("");
        } catch (error) {
            console.error(error);
            showToast("Erro ao atualizar perfil.", "error");
        } finally {
            setIsLoading(false);
        }
    }

    /* =======================
       RENDER
    ======================= */
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0F172A] via-[#020617] to-black flex items-center justify-center px-6">
            <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-8">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold text-gray-900">Meu Perfil</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Gerencie suas informações pessoais
                    </p>
                </div>

                {/* AVATAR */}
                <div className="flex justify-center mb-10">
                    <div className="relative group">
                        <div className="h-28 w-28 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shadow-inner">
                            {icone ? (
                                <img src={icone} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-primary text-4xl font-bold">
                                    {usuario?.nome?.charAt(0)?.toUpperCase() ?? "U"}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
                        >
                            <Camera className="h-4 w-4" />
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadAvatar(file);
                            }}
                        />
                    </div>
                </div>

                {/* NOME */}
                <div className="relative mb-6">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        onFocus={() => setNomeFocused(true)}
                        onBlur={() => setNomeFocused(false)}
                        className="peer w-full rounded-xl border border-gray-300 bg-transparent pl-11 pr-4 pt-6 pb-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                    />
                    <label className={`absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none transition-all duration-300 ${nomeFocused || nome ? "scale-75 -translate-y-[1.75rem] text-primary" : ""}`}>
                        Nome
                    </label>
                </div>

                {/* BLOCO SENHA */}
                <div className="mb-6">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            onFocus={() => setSenhaFocused(true)}
                            onBlur={() => setSenhaFocused(false)}
                            className="peer w-full rounded-xl border border-gray-300 bg-transparent pl-11 pr-12 pt-6 pb-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                        />
                        <label className={`absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none transition-all duration-300 ${senhaFocused || senha ? "scale-75 -translate-y-[1.75rem] text-primary" : ""}`}>
                            Nova senha
                        </label>
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                        >
                            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div
                        className={`
        overflow-hidden
        transition-all duration-500 ease-out
        ${
                            senhaFocused || senha.length >= 3
                                ? "max-h-[260px] opacity-100 translate-y-0 mt-4"
                                : "max-h-0 opacity-0 -translate-y-2"
                        }
    `}
                    >
                        <div className="rounded-2xl border bg-white/70 p-4 shadow-inner">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${forcaCor}`}
                                    style={{ width: `${forcaPercentual}%` }}
                                />
                            </div>

                            <div className="mt-4 space-y-2">
                                {senhaRegras.map(r => {
                                    const ok = r.test(senha);
                                    return (
                                        <div
                                            key={r.label}
                                            className={`flex items-center gap-2 text-sm transition-all ${
                                                ok ? "text-emerald-600" : "text-gray-400"
                                            }`}
                                        >
                        <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                                ok
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-gray-300"
                            }`}
                        >
                            {ok && "✓"}
                        </span>
                                            {r.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONFIRMAR */}
                <div className="relative mb-8">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${confirmarSenha ? (confirmacaoOk ? "text-emerald-500" : "text-red-500") : "text-gray-400"}`} />
                    <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        onFocus={() => setConfirmarFocused(true)}
                        onBlur={() => setConfirmarFocused(false)}
                        className="peer w-full rounded-xl border border-gray-300 bg-transparent pl-11 pr-12 pt-6 pb-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                    />
                    <label className={`absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none transition-all duration-300 ${confirmarFocused || confirmarSenha ? "scale-75 -translate-y-[1.75rem] text-primary" : ""}`}>
                        Confirmar senha
                    </label>
                </div>

                {/* AÇÃO */}
                <BotaoPrimario
                    label="Salvar alterações"
                    icon={<Save className="h-5 w-5" />}
                    disabled={!podeSalvar}
                    onClick={salvarPerfil}
                />
            </div>
        </div>
    );
}
