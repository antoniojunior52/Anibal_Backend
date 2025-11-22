const tf = require('@tensorflow/tfjs');
const nsfw = require('nsfwjs');
const jpeg = require('jpeg-js');

let model;

// Carrega o modelo apenas uma vez (Singleton)
const loadModel = async () => {
    if (model) return model;
    console.log("⏳ Carregando modelo NSFW...");
    model = await nsfw.load(); // Baixa o modelo da web na primeira vez
    console.log("✅ Modelo NSFW carregado!");
    return model;
};

const checkImage = async (imageBuffer) => {
    const _model = await loadModel();

    // Decodifica a imagem (necessário pois Node puro não tem <canvas>)
    const image = await jpeg.decode(imageBuffer, true);
    
    const numChannels = 3;
    const numPixels = image.width * image.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let c = 0; c < numChannels; c++) {
            values[i * numChannels + c] = image.data[i * 4 + c];
        }
    }

    const tensor = tf.tensor3d(values, [image.height, image.width, numChannels], 'int32');
    
    const predictions = await _model.classify(tensor);
    tensor.dispose(); // Limpa memória

    // Regra: Se Porn ou Hentai tiverem mais de 50% de certeza
    const isUnsafe = predictions.some(p => 
        ['Porn', 'Hentai'].includes(p.className) && p.probability > 0.50
    );

    return isUnsafe;
};

module.exports = { checkImage };