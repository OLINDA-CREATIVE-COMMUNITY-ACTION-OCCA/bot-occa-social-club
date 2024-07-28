import dotenv from 'dotenv';
import { getAuthToken } from './util/authToken.js';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js'; // Importa as classes e funções necessárias do discord.js
import { handleRankingInteraction } from './views/ranking.js'; // Importa a função de manipulação da interação de ranking
import { handlePointsBySprintInteraction } from './views/pontosPorSprintInteraction.js'; // Importa a função de manipulação da interação de pontos por sprint
import { sendLongMessage } from './services/ServiceMensagens.js'; // Importa a função para enviar mensagens longas
import  consoleOccinho from './util/ConsoleOccinho.js';
import { sequelize, startDatabase } from './util/Database.js';
// Import the built-in data types
import { DataTypes } from 'sequelize';


dotenv.config()
let authTokenEva = ''
// Configuração do bot do Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] // Define as intenções do bot
});

client.once('ready', () => { // Evento acionado quando o bot estiver pronto
    console.log('Bot está online!'); // Exibe uma mensagem no console
});

// Registrar os comandos de barra
const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN); // Cria uma nova instância do REST e define o token do bot

(async () => {
    try {
        console.log("Pegando a chave da api de eva")
        authTokenEva = await getAuthToken(process.env.EMAIL, process.env.PASSWORD)
        console.log('Registrando comandos de barra...');
        await startDatabase();
        
        await rest.put( // Registra os comandos de barra
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // Define as rotas para os comandos
            {
                body: [ // Define a estrutura dos comandos de barra
                    {name: 'ranking', description: 'Atualiza os projetos e mostra o ranking de usuários'},
                    {name: 'pontos-por-sprint', description: 'Mostra os pontos de EVA por assinante Atualizados'},
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

    const {commandName} = interaction; // Obtém o nome do comando

    if (commandName === 'ranking') { // Se o comando for 'ranking'
        await handleRankingInteraction(interaction, authTokenEva); // Chama a função de manipulação de ranking
    } else if (commandName === 'pontos-por-sprint') { // Se o comando for 'pontos-por-sprint'
        await handlePointsBySprintInteraction(interaction, authTokenEva); // Chama a função de manipulação de pontos por sprint
    }
});

client.login(process.env.DISCORD_TOKEN); // Faz login no Discord com o token do bot
