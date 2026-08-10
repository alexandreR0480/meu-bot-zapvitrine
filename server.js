const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota que vai receber as mensagens do WhatsApp (Webhook da Evolution API)
app.post('/webhook-whatsapp', (req, res) => {
    try {
        const data = req.body;
        console.log("Mensagem recebida do WhatsApp:", JSON.stringify(data, null, 2));

        // Aqui você pode colocar a lógica para responder o cliente
        // Exemplo: se a mensagem for "olá", responder com o cardápio ou menu da vitrine.

        res.status(200).json({ status: "success", message: "Webhook processado com sucesso!" });
    } catch (error) {
        console.error("Erro ao processar webhook:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});