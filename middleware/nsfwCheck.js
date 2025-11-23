const { checkImage } = require('../utils/nsfwFilter');

const nsfwMiddleware = async (req, res, next) => {
    try {
        // 1. Verifica upload único (Team, News, User)
        if (req.file) {
            const isUnsafe = await checkImage(req.file.buffer);
            if (isUnsafe) {
                return res.status(400).json({ error: "CONTEÚDO BLOQUEADO: Imagem imprópria detectada." });
            }
        }

        // 2. Verifica múltiplos uploads (Gallery)
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // Verifica todas as imagens em paralelo
            const checks = await Promise.all(req.files.map(file => checkImage(file.buffer)));
            
            // Se ALGUMA imagem for insegura, bloqueia tudo
            if (checks.some(isUnsafe => isUnsafe === true)) {
                return res.status(400).json({ error: "CONTEÚDO BLOQUEADO: Uma ou mais imagens da galeria são impróprias." });
            }
        }

        next(); // Tudo limpo, pode passar

    } catch (error) {
        console.error("Erro no filtro NSFW:", error);
        // FIX DE SEGURANÇA:
        // Se der erro ao analisar (arquivo corrompido ou formato estranho), BLOQUEIA.
        // É melhor bloquear um falso positivo do que deixar passar um erro.
        return res.status(500).json({ 
            error: "Erro ao verificar segurança da imagem. Tente enviar um arquivo JPG ou PNG válido." 
        });
    }
};

module.exports = nsfwMiddleware;