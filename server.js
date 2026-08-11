const express = require('express');
const axios = require('axios'); // Vamos usar para enviar requisições para a Evolution API
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota que recebe os eventos da Evolution API
app.post('/webhook-whatsapp', async (req, res) => {
    try {
        const data = req.body;
        console.log("Evento recebido da Evolution API:", data.event);

        // Verifica se é uma nova mensagem recebida (evento messages.upsert)
        if (data.event === "messages.upsert") {
            const messageData = data.data;
            
            // Pega o número do remetente e o texto da mensagem
            const remoteJid = messageData.key.remoteJid;
            const messageContent = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text;
            const fromMe = messageData.key.fromMe;

            // Se a mensagem veio de um cliente (não de você mesmo) e tem texto
            if (!fromMe && messageContent) {
                console.log(`Mensagem de ${remoteJid}: "${messageContent}"`);

                // Configurações da sua Evolution API local/Docker
                // ATENÇÃO: Como o Render está na nuvem, ele precisa falar com a sua Evolution API.
                // Se a Evolution estiver no seu PC, você precisará de uma URL pública (como o Ngrok) para a Evolution também,
                // ou pode testar a resposta simulando o envio.
                
                const evolutionApiUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080";
                const evolutionApiKey = process.env.EVOLUTION_API_KEY || "SUA_API_KEY_AQUI";
                const instanceName = "zapvitrine-bot";

                // Texto de resposta do bot
                const respostaBot = `Olá! Recebi sua mensagem: "${messageContent}". Em breve nosso atendimento automático estará completo!`;

                // Enviando a resposta de volta pelo WhatsApp usando a Evolution API
                try {
                    await axios.post(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
                        number: remoteJid,
                        text: respostaBot
                    }, {
                        headers: {
                            apikey: evolutionApiKey
                        }
                    });
                    console.log("Resposta enviada com sucesso para o cliente!");
                } catch (sendError) {
                    console.error("Erro ao enviar resposta pela Evolution API:", sendError.message);
                }
            }
        }

        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Erro no Webhook:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor do bot rodando na porta ${PORT}`);
});