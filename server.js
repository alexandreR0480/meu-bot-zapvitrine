const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Memória temporária para guardar o estado dos clientes (em produção, use Redis ou MongoDB)
// Chave: Número do WhatsApp do cliente -> Valor: Objeto de Estado
const sessoesClientes = {};

// Simulação do seu catálogo de serviços da Loja
const lojaExemplo = {
    nome: "Salão Bella Vista",
    whatsappAtendente: "5511999999999",
    servicos: [
        { nome: "Corte e Escova", preco: 90, tempo: "45 min" },
        { nome: "Fibra Bio Humana", preco: 280, tempo: "60 min" }
    ]
};

// Rota de Webhook que recebe as mensagens do WhatsApp
app.post('/webhook-whatsapp', async (req, res) => {
    const { remetente, mensagem } = req.body; // Dados vindos da API do WhatsApp
    
    if (!sessoesClientes[remetente]) {
        sessoesClientes[remetente] = { etapa: 'inicio', servico: null, data: null, horario: null };
    }

    let clienteState = sessoesClientes[remetente];
    let respostaTexto = "";

    // MÁQUINA DE ESTADOS (O Fluxo do Bot)
    if (clienteState.etapa === 'inicio') {
        if (mensagem.trim() === '1') {
            clienteState.etapa = 'escolher_servico';
            let lista = lojaExemplo.servicos.map((s, i) => `${i + 1} - ${s.nome} (R$ ${s.preco})`).join('\n');
            respostaTexto = `📋 Escolha o serviço:\n\n${lista}\n\nDigite o número ou nome do serviço:`;
        } else {
            respostaTexto = `Olá! Bem-vindo ao atendimento da ${lojaExemplo.nome}.\n\nDigite **1** para ver os Serviços e Agendar.`;
        }
    } 
    else if (clienteState.etapa === 'escolher_servico') {
        clienteState.servico = mensagem.trim();
        clienteState.etapa = 'pedir_data';
        respostaTexto = `📅 Perfeito! Qual a **data desejada** para o agendamento? (Ex: 10/08):`;
    } 
    else if (clienteState.etapa === 'pedir_data') {
        clienteState.data = mensagem.trim();
        clienteState.etapa = 'pedir_horario';
        respostaTexto = `⏰ Anotado (${clienteState.data}). Qual o **horário** prefere? (Ex: 14:00):`;
    } 
    else if (clienteState.etapa === 'pedir_horario') {
        clienteState.horario = mensagem.trim();
        clienteState.etapa = 'pedir_nome';
        respostaTexto = `👤 Quase pronto! Por fim, digite seu **Nome Completo**:`;
    } 
    else if (clienteState.etapa === 'pedir_nome') {
        clienteState.nome = mensagem.trim();
        
        // AQUI ACONTECE A MÁGICA: Notificar a Atendente e salvar o registro
        respostaTexto = `✅ Agendamento solicitado com sucesso!\n\nO(a) atendente ${lojaExemplo.nome} recebeu seus dados e já vai confirmar no seu privado.`;
        
        // Disparar alerta interno para o WhatsApp da Atendente
        enviarMensagemParaAtendente(lojaExemplo.whatsappAtendente, 
            `🚨 *NOVO AGENDAMENTO PENDENTE!*\n\n👤 Cliente: ${clienteState.nome}\n💇‍♀️ Serviço: ${clienteState.servico}\n📅 Data/Hora: ${clienteState.data} às ${clienteState.horario}\n📱 Contato: ${remetente}`
        );

        // Reseta a sessão do cliente
        delete sessoesClientes[remetente];
    }

    // Envia a resposta de volta para o cliente via API do WhatsApp
    await enviarMensagemWhatsApp(remetente, respostaTexto);
    
    res.status(200).send('Mensagem processada');
});

function enviarParaPainelMaster(dadosAgendamento) {
    // Aqui você faria um POST para salvar o agendamento direto na tabela do painel master que criamos
}

async function enviarMensagemWhatsApp(numeroDestino, texto) {
    // Código de integração com a API da Evolution/Meta para disparar o POST de envio
    console.log(`Enviando para ${numeroDestino}: ${texto}`);
}

async function enviarMensagemParaAtendente(numeroAtendente, textoAlerta) {
    // Dispara a notificação para o WhatsApp da atendente
    console.log(`ALERTA PARA ATENDENTE (${numeroAtendente}): ${textoAlerta}`);
}

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
