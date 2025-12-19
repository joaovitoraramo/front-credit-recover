const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const envLocalPath = path.join(__dirname, '.env');

// Lê a versão do package.json
const packageJson = require(packageJsonPath);
const version = packageJson.version;

// Conteúdo da nova linha de versão
const newVersionLine = `NEXT_PUBLIC_APP_VERSION=${version}`;

try {
    // Lê o conteúdo atual do .env.local
    let envContent = '';
    if (fs.existsSync(envLocalPath)) {
        envContent = fs.readFileSync(envLocalPath, 'utf8');
    }

    // Verifica se a linha da versão já existe no arquivo
    const versionRegex = /^NEXT_PUBLIC_APP_VERSION=.*$/m;
    if (versionRegex.test(envContent)) {
        // Se existir, substitui a linha
        envContent = envContent.replace(versionRegex, newVersionLine);
    } else {
        // Se não existir, adiciona a linha no final
        envContent += `\n${newVersionLine}`;
    }

    // Escreve o conteúdo de volta no arquivo .env.local
    fs.writeFileSync(envLocalPath, envContent.trim() + '\n', 'utf8');

    console.log(`Versão ${version} atualizada em .env.local`);
} catch (error) {
    console.error('Erro ao atualizar o arquivo .env.local:', error);
    process.exit(1);
}