// Importa a função getRankingWithSprints do controlador e sendLongMessage do serviço de mensagens
import { getRankingWithSprints } from '../controllers/ControllerRanking.js';
import { sendLongMessage } from '../services/ServiceMensagens.js';
import { addOrUpdateTasks} from '../services/ServiceTaskByProject.js';
import { addUsersToBack4App } from '../services/ServiceUsuario.js';


export async function updateData(authTokenEva) {
    try {
        // Execute as funções de atualização em paralelo
        const [newUsers, changes] = await Promise.all([
            addUsersToBack4App(authTokenEva),
            addOrUpdateTasks(authTokenEva)
        ]);
        let responseMessage = '';

        if (newUsers.length > 0) {
            responseMessage += `Novos usuários adicionados ou atualizados:\n${newUsers.join('\n')}\n\n`;
        }

        if (changes.length > 0) {
            responseMessage += `Projetos atualizados:\n${changes.join('\n')}`;
        } else {
            responseMessage += 'Nenhuma mudança detectada nos projetos.';
        }

        return responseMessage;
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        throw new Error('Erro ao atualizar dados');
    }
}

// Função assíncrona para lidar com a interação de ranking
export async function handleRankingInteraction(interaction, authTokenEva) {
    // Responde ao usuário que o processamento está em andamento
    await interaction.deferReply();
    try {
        // Atualiza os dados antes de obter o ranking
        const updateMessage = await updateData(authTokenEva);
        // Obtém o ranking com sprints
        const ranking = await getRankingWithSprints(interaction);

        // Verifica se o ranking tem dados
        if (ranking.length > 0) {
            // Mapeia o ranking para uma mensagem formatada
            const rankingMessage = ranking.map(user => `${user.posicao}. ${user.nome} - ${user.totalPontosEVA} pontos EVA, ${user.totalPontosXP.toFixed(2)} pontos XP`).join('\n');
            // Envia a mensagem formatada
            await sendLongMessage(interaction, `${updateMessage}\n\nRanking:\n${rankingMessage}`);
        } else {
            // Se não houver usuários no ranking, informa o usuário
            await interaction.followUp(`${updateMessage}\n\nNenhum usuário encontrado para gerar o ranking.`);
        }
    } catch (error) {
        // Em caso de erro, registra o erro no console e informa o usuário
        console.error('Erro ao obter ranking:', error);
        await interaction.followUp('Ocorreu um erro ao tentar obter o ranking.');
    }
}
