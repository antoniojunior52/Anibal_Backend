const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Caminho para o arquivo .env na raiz do projeto
const envPath = path.resolve(__dirname, '.env');

// Função para gerar um segredo forte
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Verifica se o arquivo .env existe e se já contém um JWT_SECRET
function setupEnv() {
  let envFileContent = '';
  
  if (fs.existsSync(envPath)) {
    console.log('Arquivo .env encontrado. Verificando JWT_SECRET...');
    envFileContent = fs.readFileSync(envPath, 'utf-8');

    // Verifica se a chave já existe e não é o placeholder
    const secretRegex = /^JWT_SECRET=.+/m;
    const placeholderRegex = /^JWT_SECRET=your_jwt_secret_key_here/m;

    if (secretRegex.test(envFileContent) && !placeholderRegex.test(envFileContent)) {
      console.log('JWT_SECRET seguro já existe no arquivo .env. Nenhuma ação necessária.');
      return; // Para a execução se já existe um segredo válido
    }

    if (placeholderRegex.test(envFileContent)) {
        console.log('Substituindo placeholder do JWT_SECRET...');
        const newSecret = generateSecret();
        envFileContent = envFileContent.replace(placeholderRegex, `JWT_SECRET=${newSecret}`);
        fs.writeFileSync(envPath, envFileContent);
        console.log('Placeholder do JWT_SECRET substituído por um segredo seguro!');
        return;
    }

  } else {
    console.log('Arquivo .env não encontrado. Criando um novo...');
  }

  // Se chegou até aqui, é porque a chave não existe ou o arquivo não existia
  const newSecret = generateSecret();
  const newSecretLine = `\nJWT_SECRET=${newSecret}\n`;

  // Adiciona a nova chave ao final do arquivo (ou cria o arquivo se não existir)
  fs.appendFileSync(envPath, newSecretLine);
  console.log('JWT_SECRET gerado e adicionado com sucesso ao arquivo .env!');
}

// Executa a função
setupEnv();