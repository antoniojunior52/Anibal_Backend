// controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Acessa sua chave de API do arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const handleChatMessage = async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'Nenhuma mensagem fornecida.' });
    }

    // Pega o modelo generativo (gemini-1.5-flash é o mais novo, rápido e eficiente)
    // Linha correta
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // O "Prompt de Sistema" é a instrução inicial que damos à IA.
    const systemPrompt = `Você é um assistente virtual para a escola "E.E. Profº Aníbal do Prado e Silva". Seu nome é Anibot. Você deve ser cordial, prestativo e informativo. Responda apenas a perguntas relacionadas à escola, como eventos, horários de aulas, história da escola, corpo docente e processo de matrícula. Se os usuários perguntarem sobre outros assuntos (como política, esportes ou tópicos não relacionados), recuse educadamente a resposta, dizendo que seu conhecimento é limitado a tópicos sobre a escola Aníbal.`;
    
    // Inicia o chat com um histórico, incluindo a instrução do sistema
    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Olá! Sou o Anibot. Como posso ajudar com informações sobre a escola Aníbal do Prado e Silva?" }] } // "model" é como o Gemini chama o "assistant"
        ]
    });

    // Envia a mensagem do usuário para o chat
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    // Retorna a resposta da IA para o frontend
    res.json({ reply: text });

  } catch (error) {
    console.error('Erro ao comunicar com a API do Google Gemini:', error);
    res.status(500).json({ error: 'Desculpe, não consegui processar sua mensagem no momento.' });
  }
};

module.exports = {
  handleChatMessage,
};