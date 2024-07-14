require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const Parse = require('parse/node'); // Importa o módulo Parse para manipulação de dados
Parse.initialize(process.env.PARSE_APP_ID, process.env.PARSE_JS_KEY); // Inicializa o Parse com as chaves da aplicação
Parse.serverURL = process.env.PARSE_SERVER_URL; // Define a URL do servidor Parse

const { getAuthToken } = require('./util/authToken');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js'); // Importa as classes e funções necessárias do discord.js
const { handleRankingInteraction } = require('./views/ranking'); // Importa a função de manipulação da interação de ranking
const { handlePontosPorSprintInteraction } = require('./views/pontosPorSprintInteraction'); // Importa a função de manipulação da interação de pontos por sprint
const { handleAtualizarInteraction } = require('./views/atualizar'); // Importa a função de manipulação da interação de atualizar
const { sendLongMessage } = require('./services/ServiceMensagens'); // Importa a função para enviar mensagens longas

let authTokenEva = getAuthToken(process.env.EMAIL, process.env.PASSWORD)

// Configuração do bot do Discord
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] // Define as intenções do bot
});

client.once('ready', () => { // Evento acionado quando o bot estiver pronto
    console.log('Bot está online!'); // Exibe uma mensagem no console
});

// Registrar os comandos de barra
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN); // Cria uma nova instância do REST e define o token do bot

(async () => {
    try {
        console.log('Registrando comandos de barra...');
        await rest.put( // Registra os comandos de barra
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // Define as rotas para os comandos
            {
                body: [ // Define a estrutura dos comandos de barra
                    { name: 'ranking', description: 'Atualiza os projetos e mostra o ranking de usuários' },
                    { name: 'pontos-por-sprint', description: 'Mostra os pontos de EVA por assinante' },
                    { name: 'atualizar', description: 'Verifica e atualiza projetos existentes com dados da API' }
                ]
            }
        );
        console.log('Comandos de barra registrados com sucesso.'); // Exibe uma mensagem no console
    } catch (error) {
        console.error('Erro ao registrar comandos de barra:', error); // Exibe uma mensagem de erro no console
    }
})();

client.on('interactionCreate', async interaction => { // Evento acionado quando uma interação é criada
    if (!interaction.isCommand()) return; // Verifica se a interação é um comando

    const { commandName } = interaction; // Obtém o nome do comando

    if (commandName === 'ranking') { // Se o comando for 'ranking'
        await handleRankingInteraction(interaction); // Chama a função de manipulação de ranking
    } else if (commandName === 'pontos-por-sprint') { // Se o comando for 'pontos-por-sprint'
        await handlePontosPorSprintInteraction(interaction); // Chama a função de manipulação de pontos por sprint
    } else if (commandName === 'atualizar') { // Se o comando for 'atualizar'
        await handleAtualizarInteraction(interaction); // Chama a função de manipulação de atualização
    }
});

client.login(process.env.DISCORD_TOKEN); // Faz login no Discord com o token do bot

module.exports = { authTokenEva }