const tf = require('@tensorflow/tfjs');
const nsfw = require('nsfwjs');
const sharp = require('sharp');

let model;

// Carrega o modelo apenas uma vez
const loadModel = async () => {
    if (model) return model;
    console.log("⏳ Carregando modelo NSFW...");
    // Carrega o modelo 'quantized' (mais leve) ou default
    model = await nsfw.load(); 
    console.log("✅ Modelo NSFW carregado!");
    return model;
};

const checkImage = async (imageBuffer) => {
    const _model = await loadModel();

    try {
        // Converte a imagem para o formato que a IA entende
        const { data, info } = await sharp(imageBuffer)
            .resize(224, 224, { fit: 'cover' })
            .removeAlpha() // Remove transparência
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        const numChannels = 3;
        const tensor = tf.tensor3d(data, [info.height, info.width, numChannels], 'int32');
        
        const predictions = await _model.classify(tensor);
        tensor.dispose(); // Limpa memória RAM

        // --- MODO ESPIÃO: MOSTRA NO TERMINAL O QUE A IA VIU ---
        console.log("🔍 Análise da IA:", predictions);
        // -----------------------------------------------------

        // REGRA DE BLOQUEIO AJUSTADA:
        // 1. Bloqueia se 'Porn' for maior que 40% (0.40)
        // 2. Bloqueia se 'Hentai' for maior que 40% (0.40)
        // 3. Bloqueia se 'Sexy' (provocante) for maior que 80% (0.80) - Opcional para escola
        const isUnsafe = predictions.some(p => {
            if (p.className === 'Porn' && p.probability > 0.40) return true;
            if (p.className === 'Hentai' && p.probability > 0.40) return true;
            if (p.className === 'Sexy' && p.probability > 0.85) return true; // Escola: bloqueia sensualidade excessiva
            return false;
        });

        if (isUnsafe) {
            console.log("🚨 BLOQUEADO: Conteúdo impróprio detectado.");
        } else {
            console.log("✅ APROVADO: Imagem considerada segura.");
        }

        return isUnsafe;

    } catch (error) {
        console.error("Erro técnico ao analisar imagem com IA:", error);
        // Se der erro na conversão, por segurança, consideramos inseguro ou lançamos erro
        throw error; 
    }
};

module.exports = { checkImage };