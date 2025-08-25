
// Adicione esta rota no seu arquivo de back-end (por exemplo, app.js), antes das rotas de erro.
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  let reply = "Desculpe, não consegui encontrar informações sobre isso. Tente perguntar sobre 'eventos', 'horários' ou 'história'.";

  if (message) {
    const normalizedMessage = message.toLowerCase().trim();

    if (normalizedMessage.includes("evento")) {
      reply = "Estamos a planear uma feira de ciências incrível para o final do ano letivo. Fique atento às nossas notícias para mais detalhes!";
    } else if (normalizedMessage.includes("história")) {
      reply = "A nossa escola foi fundada em 1985 com a missão de promover a educação de qualidade na comunidade. Você pode ler mais sobre ela na página 'História'.";
    } else if (normalizedMessage.includes("horários") || normalizedMessage.includes("aulas")) {
      reply = "Os horários das aulas estão disponíveis na secção 'Horários' do nosso site. Pode fazer o download do arquivo em PDF lá.";
    } else if (normalizedMessage.includes("equipe") || normalizedMessage.includes("professores")) {
      reply = "Temos uma equipa de professores altamente qualificada e dedicada. Conheça a nossa equipa na página 'Professores' do site.";
    }
  }

  res.json({ reply });
});