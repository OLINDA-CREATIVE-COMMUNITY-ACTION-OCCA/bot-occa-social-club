// Importa as funções necessárias dos serviços
const { addOrUpdateTaskByProjectsToBack4App } = require('../services/ServiceTaskByProject');
const { addUsersToBack4App } = require('../services/ServiceUsuario');
const { sendLongMessage } = require('../services/ServiceMensagens');
const {consoleOccinho} = require("../util/ConsoleOccinho");

const logPath = "autalizar.js"

/**
 * Função assíncrona para lidar com a interação de atualizar
 * @param {*} interaction 
 */
async function handleAtualizarInteraction(interaction) {
    // Responde ao usuário que o processamento está em andamento
    await interaction.deferReply();
    try {
        // Adiciona ou atualiza os usuários no Back4App
        consoleOccinho?.time("addUsersToBack4App");
        const newUsers = await addUsersToBack4App();
        consoleOccinho?.timeEnd("addUsersToBack4App");
        // Adiciona ou atualiza os projetos no Back4App
        consoleOccinho?.time("addOrUpdateTaskByProjectsToBack4App");
        const changes = await addOrUpdateTaskByProjectsToBack4App();
        consoleOccinho?.timeEnd("addOrUpdateTaskByProjectsToBack4App");
        let responseMessage = '';

        // Verifica se há novos usuários adicionados ou atualizados e prepara a mensagem de resposta
        if (newUsers.length > 0) {
            responseMessage += `Novos usuários adicionados ou atualizados:\n${newUsers.join('\n')}\n\n`;
        }

        // Verifica se há mudanças nos projetos e prepara a mensagem de resposta
        if (changes.length > 0) {
            responseMessage += `Projetos atualizados:\n${changes.join('\n')}`;
        } else {
            responseMessage += 'Nenhuma mudança detectada nos projetos.';
        }

        // Envia a mensagem de resposta ao usuário
        consoleOccinho?.time("sendLongMessage");
        await sendLongMessage(interaction, responseMessage);
        consoleOccinho?.timeEnd("sendLongMessage");
    } catch (error) {
        // Em caso de erro, registra o erro no console e informa o usuário
        console.error('Erro ao atualizar dados:', error);
        await interaction.followUp('Ocorreu um erro ao tentar atualizar os dados.');
    }
}

// Exporta a função handleAtualizarInteraction para uso em outros módulos
module.exports = { handleAtualizarInteraction };
