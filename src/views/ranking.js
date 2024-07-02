// Importa a função getRankingWithSprints do controlador e sendLongMessage do serviço de mensagens
const { getRankingWithSprints } = require('../controllers/ControllerRanking');
const { sendLongMessage } = require('../services/ServiceMensagens');

// Função assíncrona para lidar com a interação de ranking
async function handleRankingInteraction(interaction) {
    // Responde ao usuário que o processamento está em andamento
    await interaction.deferReply();
    try {
        // Obtém o ranking com sprints
        const ranking = await getRankingWithSprints();

        // Verifica se o ranking tem dados
        if (ranking.length > 0) {
            // Mapeia o ranking para uma mensagem formatada
            const rankingMessage = ranking.map(user => `${user.posicao}. ${user.nome} - ${user.totalPontosEVA} pontos EVA, ${user.totalPontosXP.toFixed(2)} pontos XP`).join('\n');
            // Envia a mensagem formatada
            await sendLongMessage(interaction, `Ranking:\n${rankingMessage}`);
        } else {
            // Se não houver usuários no ranking, informa o usuário
            await interaction.followUp('Nenhum usuário encontrado para gerar o ranking.');
        }
    } catch (error) {
        // Em caso de erro, registra o erro no console e informa o usuário
        console.error('Erro ao obter ranking:', error);
        await interaction.followUp('Ocorreu um erro ao tentar obter o ranking.');
    }
}

// Exporta a função handleRankingInteraction para uso em outros módulos
module.exports = { handleRankingInteraction };
