// scripts/notify.js
import fetch from "node-fetch";

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const project = process.env.VERCEL_PROJECT_NAME || "Projeto Vercel";
const url = process.env.VERCEL_URL || "N/A";
const commit = process.env.VERCEL_GIT_COMMIT_SHA || "desconhecido";

if (!token || !chatId) {
    console.log("Telegram não configurado");
    process.exit(0);
}

const message = `
🚀 DEPLOY FINALIZADO

Projeto: ${project}
Commit: ${commit}
URL: https://${url}
`;

await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        chat_id: chatId,
        text: message,
    }),
});

console.log("Notificação enviada ao Telegram");
