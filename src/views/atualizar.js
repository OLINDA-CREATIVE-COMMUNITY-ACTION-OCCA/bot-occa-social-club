const { addOrUpdateProjectsToBack4App } = require('../services/ServiceTaskByProject');
const { addUsersToBack4App } = require('../services/ServiceUsuario');
const { sendLongMessage } = require('../services/ServiceMensagens');

async function handleAtualizarInteraction(interaction) {
    try {
        // Verifica se a interação já foi deferida ou respondida
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply();
        } else {
            console.log('Interação já foi deferida ou respondida.');
            return;
        }

        // Execute as funções em paralelo
        const [newUsers, changes] = await Promise.all([addUsersToBack4App(), addOrUpdateProjectsToBack4App()]);
        let responseMessage = '';

        if (newUsers.length > 0) {
            responseMessage += `Novos usuários adicionados ou atualizados:\n${newUsers.join('\n')}\n\n`;
        }

        if (changes.length > 0) {
            responseMessage += `Projetos atualizados:\n${changes.join('\n')}`;
        } else {
            responseMessage += 'Nenhuma mudança detectada nos projetos.';
        }

        await sendLongMessage(interaction, responseMessage);
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);

        // Verifica se a interação foi deferida antes de tentar seguir com a resposta de erro
        if (!interaction.deferred && !interaction.replied) {
            await interaction.reply('Ocorreu um erro ao tentar deferir a resposta.');
        } else {
            await interaction.followUp('Ocorreu um erro ao tentar atualizar os dados.');
        }
    }
}

module.exports = { handleAtualizarInteraction };