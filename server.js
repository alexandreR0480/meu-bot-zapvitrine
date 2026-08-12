const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const sessoesClientes = {};

function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

app.post('/webhook-whatsapp', async (req, res) => {
    try {
        const data = req.body;
        console.log("Evento recebido da Evolution API:", data.event);

        if (data.event === "messages.upsert") {
            const messageData = data.data;
            const remoteJid = messageData.key.remoteJid;
            const messageContent = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text;
            const fromMe = messageData.key.fromMe;

            if (!fromMe && messageContent) {
                const textoRecebido = messageContent.trim();
                console.log(`Mensagem de ${remoteJid}: "${textoRecebido}"`);

                const evolutionApiUrl = "https://labrador-flyer-backlands.ngrok-free.dev"; 
                const evolutionApiKey = "sua_chave_secreta_aqui_123";
                const instanceName = "zapvitrine-bot";
                const nomeLoja = "Salão Neurifran";

                const servicosLoja = [
                    { nome: "Aplicação de Tintura com Escova", preco: 80, tempo: "45 min" },
                    { nome: "Avaliação de Mega hair", preco: 10, tempo: "15 min" },
                    { nome: "Botox Curto", preco: 120, tempo: "60 min" },
                    { nome: "Corte", preco: 50, tempo: "30 min" },
                    { nome: "Corte Finalizado", preco: 80, tempo: "45 min" },
                    { nome: "Cronograma Longo", preco: 280, tempo: "90 min" },
                    { nome: "Cronograma Pacote Curto e Médio", preco: 240, tempo: "60 min" },
                    { nome: "Dermaplannig", preco: 70, tempo: "30 min" },
                    { nome: "Design com Henna", preco: 35, tempo: "30 min" },
                    { nome: "Design Simples", preco: 25, tempo: "20 min" },
                    { nome: "Escova Curto", preco: 50, tempo: "30 min" },
                    { nome: "Escova Médio", preco: 55, tempo: "35 min" },
                    { nome: "Escova Longo", preco: 70, tempo: "40 min" },
                    { nome: "Escova Megahair", preco: 80, tempo: "45 min" },
                    { nome: "Fibra Bio 300gr", preco: 380, tempo: "120 min" },
                    { nome: "Fibra Bio Cacheada 300gr", preco: 420, tempo: "120 min" },
                    { nome: "Fibra Bio Humana 200gr", preco: 280, tempo: "90 min" },
                    { nome: "Hidratação Curto", preco: 65, tempo: "30 min" },
                    { nome: "Hidratação Médio", preco: 75, tempo: "40 min" },
                    { nome: "Hidratação Longo", preco: 80, tempo: "45 min" },
                    { nome: "Hydraglos", preco: 75, tempo: "40 min" },
                    { nome: "Limpeza de Pele", preco: 120, tempo: "60 min" },
                    { nome: "Manutenção Megahair", preco: 200, tempo: "90 min" },
                    { nome: "Mesoterapia Capilar", preco: 250, tempo: "60 min" },
                    { nome: "Nutrição Curto", preco: 75, tempo: "35 min" },
                    { nome: "Nutrição Médio", preco: 80, tempo: "40 min" },
                    { nome: "Nutrição Longo", preco: 85, tempo: "90 min" },
                    { nome: "PAC Escova Longo", preco: 240, tempo: "60 min"},
                    { nome: "PAC Escova Curto e Médio", preco: 200, tempo: "60 min"},
                    { nome: "Progressiva Curto Formol", preco: 150, tempo: "180 min"},
                    { nome: "Progressiva Extra Longo", preco: 200, tempo: "210 min"},
                    { nome: "Progressiva Longo", preco: 180, tempo: "210 min"},
                    { nome: "Progressiva Médio", preco: 170, tempo: "180 min"},
                    { nome: "Reconstrução Curto", preco: 80, tempo: "60 min"},
                    { nome: "Reconstrução Médio", preco: 100, tempo: "60 min"},
                    { nome: "Reconstrução Longo", preco: 100, tempo: "80 min"},
                    { nome: "Tintura 1 Tubo com Escova", preco: 110, tempo: "100 min"},
                    { nome: "Tintura 2 Tubos", preco: 140, tempo: "100 min"}
                ];

                if (!sessoesClientes[remoteJid]) {
                    sessoesClientes[remoteJid] = { etapa: 'inicio', servicoEscolhido: null, dataEscolhida: null, horarioEscolhido: null, nomeCliente: null };
                }
                let sessao = sessoesClientes[remoteJid];
                let respostaBot = "";
                let enviarFotos = false;

                if (sessao.etapa === 'inicio') {
                    if (textoRecebido === '1' || removerAcentos(textoRecebido).includes('servico') || removerAcentos(textoRecebido).includes('corte') || removerAcentos(textoRecebido).includes('agendar')) {
                        sessao.etapa = 'escolher_servico';
                        let listaServicos = servicosLoja.map(s => `• *${s.nome}* — R$ ${s.preco.toFixed(2)} (⏱️ ${s.tempo})`).join('\n');
                        respostaBot = `📋 *Nossos Serviços:*\n\n${listaServicos}\n\n👉 Digite o *nome exato* do serviço que deseja agendar:`;
                    } else if (textoRecebido === '2' || removerAcentos(textoRecebido).includes('foto') || removerAcentos(textoRecebido).includes('trabalho') || removerAcentos(textoRecebido).includes('galeria')) {
                        enviarFotos = true;
                        let listaServicosResumida = servicosLoja.map(s => `• ${s.nome} — R$ ${s.preco.toFixed(2)}`).join('\n');
                        respostaBot = `📁 *Serviços e Galeria do ${nomeLoja}:*\n\n${listaServicosResumida}\n\n👉 Para agendar um serviço, digite 1.`;
                    } else {
                        respostaBot = `Olá! Seja bem-vindo(a) ao atendimento automatizado da *${nomeLoja}*. Como posso te ajudar hoje?\n\nDigite *1* para ver nossos Serviços ou digite *2* para ver fotos dos Trabalhos Realizados.`;
                    }
                } else if (sessao.etapa === 'escolher_servico') {
                    let textoBusca = removerAcentos(textoRecebido);
                    let servicoEncontrado = servicosLoja.find(s => removerAcentos(s.nome).includes(textoBusca));

                    if (servicoEncontrado) {
                        sessao.servicoEscolhido = servicoEncontrado;
                        sessao.etapa = 'pedir_data';
                        respostaBot = `✨ Excelente escolha: *${servicoEncontrado.nome}* (R$ ${servicoEncontrado.preco.toFixed(2)}).\n\n📅 Por favor, informe a *data desejada* para o agendamento (Ex: 15/08):`;
                    } else {
                        respostaBot = `❌ Não encontrei esse serviço. Por favor, digite o nome correto de um dos serviços oferecidos:`;
                    }
                } else if (sessao.etapa === 'pedir_data') {
                    sessao.dataEscolhida = textoRecebido;
                    sessao.etapa = 'pedir_horario';
                    respostaBot = `📅 Data selecionada: *${sessao.dataEscolhida}*.\n\n⏰ Agora, informe o *horário desejado* (Ex: 14:00):`;
                } else if (sessao.etapa === 'pedir_horario') {
                    sessao.horarioEscolhido = textoRecebido;
                    sessao.etapa = 'pedir_nome';
                    respostaBot = `⏰ Horário selecionado: *${sessao.horarioEscolhido}*.\n\n👤 Para finalizar e enviar seu pedido para nossa equipe confirmar, por favor, informe seu *Nome Completo*:`;
                } else if (sessao.etapa === 'pedir_nome') {
                    sessao.nomeCliente = textoRecebido;
                    respostaBot = `✅ *Solicitação de Agendamento Enviada com Sucesso!* 🎉\n\n👤 *Cliente:* ${sessao.nomeCliente}\n💇‍♀️ *Serviço:* ${sessao.servicoEscolhido.nome} (R$ ${sessao.servicoEscolhido.preco.toFixed(2)})\n📅 *Data/Horário:* ${sessao.dataEscolhida} às ${sessao.horarioEscolhido}`;
                    sessao.etapa = 'inicio';
                }

                // Envia a resposta de texto
                try {
                    await axios.post(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
                        number: remoteJid,
                        text: respostaBot
                    }, {
                        headers: { apikey: evolutionApiKey }
                    });

                    // Se digitou 2, envia as 14 fotos direto do GitHub
                    if (enviarFotos) {
                        // ATENÇÃO: Substitua 'SEU_USUARIO' e 'SEU_REPOSITORIO' pelos seus dados reais do GitHub
                        const baseUrlGit = "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/";
                        
                        const arquivosImagens = [
                            "img1.png", "img2.png", "img3.png", "img4.jpeg", "img5.jpeg", 
                            "img6.jpeg", "img7.jpeg", "img8.jpeg", "img9.jpeg", "img10.jpeg", 
                            "img11.jpeg", "img12.jpeg", "img13.jpeg", "img14.jpeg"
                        ];

                        for (let arquivo of arquivosImagens) {
                            let fotoUrl = baseUrlGit + arquivo;
                            await axios.post(`${evolutionApiUrl}/message/sendMedia/${instanceName}`, {
                                number: remoteJid,
                                mediatype: "image",
                                media: fotoUrl,
                                caption: "✨ Trabalho realizado pelo Salão Neurifran"
                            }, {
                                headers: { apikey: evolutionApiKey }
                            });
                        }
                        console.log("As 14 fotos da galeria foram enviadas com sucesso!");
                    }

                } catch (sendError) {
                    console.error("Erro ao enviar resposta/mídia:", sendError.response?.data || sendError.message);
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