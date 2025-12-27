// scripts/notify.js
import fs from "fs";

// ===== Variáveis da Vercel =====
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const project = process.env.VERCEL_PROJECT_NAME || "Projeto Vercel";
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || "desconhecido";
const commitMsg = process.env.VERCEL_GIT_COMMIT_MESSAGE || "Mensagem não disponível";

// ===== Versão do package.json =====
let version = "desconhecida";

try {
    const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    version = pkg.version || version;
} catch {
    console.log("Não foi possível ler a versão do package.json");
}

// ===== Validação =====
if (!token || !chatId) {
    console.log("Telegram não configurado");
    process.exit(0);
}

// ===== Mensagem =====
const message = `
🚀 <b>DEPLOY DO FRONT FINALIZADO</b>

📦 Projeto: ${project}
🏷️ Versão: ${version}
🧩 Commit Id: ${commitSha}
📝 Mensagem: ${commitMsg}
🌐 URL: https://app.creditrecoverconciliadora.com.br
`;

// ===== Envio =====
await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
    }),
});

console.log("Notificação enviada ao Telegram");
