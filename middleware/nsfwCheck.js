const { checkImage } = require('../utils/nsfwFilter');

const nsfwMiddleware = async (req, res, next) => {
    // 1. Verifica upload único (Team, News, User)
    if (req.file) {
        try {
            const isUnsafe = await checkImage(req.file.buffer);
            if (isUnsafe) {
                return res.status(400).json({ error: "CONTEÚDO BLOQUEADO: Imagem imprópria detectada." });
            }
        } catch (error) {
            console.error("Erro NSFW (Single):", error);
        }
    }

    // 2. Verifica múltiplos uploads (Gallery)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
            // Verifica todas as imagens em paralelo
            const checks = await Promise.all(req.files.map(file => checkImage(file.buffer)));
            
            // Se ALGUMA imagem for insegura, bloqueia tudo
            if (checks.some(isUnsafe => isUnsafe === true)) {
                return res.status(400).json({ error: "CONTEÚDO BLOQUEADO: Uma ou mais imagens da galeria são impróprias." });
            }
        } catch (error) {
            console.error("Erro NSFW (Array):", error);
        }
    }

    next();
};

module.exports = nsfwMiddleware;