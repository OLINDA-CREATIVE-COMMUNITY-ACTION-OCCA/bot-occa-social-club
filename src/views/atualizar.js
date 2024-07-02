// Importa as funções necessárias dos serviços
const { addOrUpdateProjectsToBack4App } = require('../services/ServiceProjeto');
const { addUsersToBack4App } = require('../services/ServiceUsuario');
const { sendLongMessage } = require('../services/ServiceMensagens');

// Função assíncrona para lidar com a interação de atualizar
async function handleAtualizarInteraction(interaction) {
    // Responde ao usuário que o processamento está em andamento
    await interaction.deferReply();
    try {
        // Adiciona ou atualiza os usuários no Back4App
        const newUsers = await addUsersToBack4App();
        // Adiciona ou atualiza os projetos no Back4App
        const changes = await addOrUpdateProjectsToBack4App();
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
        await sendLongMessage(interaction, responseMessage);
    } catch (error) {
        // Em caso de erro, registra o erro no console e informa o usuário
        console.error('Erro ao atualizar dados:', error);
        await interaction.followUp('Ocorreu um erro ao tentar atualizar os dados.');
    }
}

// Exporta a função handleAtualizarInteraction para uso em outros módulos
module.exports = { handleAtualizarInteraction };
