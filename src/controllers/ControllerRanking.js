import { calcularPontosEVA, calcularPontosXP } from '../services/ServicePontos.js'; // Importa funções para calcular pontos EVA e XP
import  User  from '../models/User.js';
import  Task  from '../models/Task.js';
import consoleOccinho from "../util/ConsoleOccinho.js";


export async function getRankingWithSprints(interaction) {
    try {
        const storedTasks = await Task.findAll(); // Obtém projetos armazenados
        const storedUsers = await User.findAll(); // Obtém usuários armazenados

        /**
         *  Array para armazenar o ranking dos usuários 
        */
        const ranking = [];

        for (const user of storedUsers) {
            const pontosPorSprint = {}; // Objeto para armazenar pontos por sprint
            let numeroSprintsParticipadas = 0; // Contador de sprints participadas
            let totalPontosEVA = 0; // Total de pontos EVA
            let totalPontosXP = 0; // Total de pontos XP

            for (const task of storedTasks) {
                // consoleOccinho?.log("assigners ids", task.eva_assigners_id)
                if (task.eva_assigners_id?.includes(user.eva_id) && task.eva_status_name === 'Concluído') {
                    const pontosEVA = await calcularPontosEVA(
                        task.eva_title,
                        task.eva_description,
                        task.eva_assigners_id,
                        user.eva_name,
                        storedUsers,
                        interaction);

                    if (!pontosPorSprint[task.eva_sprint_name]) {
                        pontosPorSprint[task.eva_sprint_name] = {
                            pontosEVA: pontosEVA,
                            pontosXP: 0
                        };
                    } else {
                        pontosPorSprint[task.eva_sprint_name].pontosEVA += pontosEVA;
                    }

                    // Incrementa o número de sprints participadas
                    numeroSprintsParticipadas++;
                }
            }

            const sprints = Object.keys(pontosPorSprint); // Obtém as chaves (sprints)
            sprints.sort((a, b) => { // Ordena as sprints numericamente
                const matchA = a.match(/\d+/);
                const matchB = b.match(/\d+/);
                const sprintNumA = matchA ? parseInt(matchA[0], 10) : 1000;
                const sprintNumB = matchB ? parseInt(matchB[0], 10) : 1000;
                return sprintNumA - sprintNumB;
            });

            sprints.forEach((sprint, index) => {
                const pontosEVA = pontosPorSprint[sprint].pontosEVA;
                totalPontosEVA += pontosEVA; // Acumula pontos EVA

                let mediaPontosEVA = 0;
                let pontosXP = 0;

                if (index === 0 || index === 1) {
                    // Primeira e segunda sprint: 1 PontosEVA equivale a 30 XP
                    pontosXP = pontosEVA * 30;
                } else if (index >= 2) {
                    // Terceira sprint em diante: média da atual, última e penúltima
                    const pontosEVAAtual = pontosPorSprint[sprint].pontosEVA;
                    const pontosEVAPassada =
                        pontosPorSprint[sprints[index - 1]].pontosEVA;
                    const pontosEVAPenultima =
                        pontosPorSprint[sprints[index - 2]].pontosEVA;

                    mediaPontosEVA =
                        (pontosEVAAtual + pontosEVAPassada + pontosEVAPenultima) / 3;
                    pontosXP = calcularPontosXP(
                        pontosEVA,
                        mediaPontosEVA,
                        numeroSprintsParticipadas
                    );
                }

                pontosPorSprint[sprint].pontosXP = pontosXP; // Armazena pontos XP para a sprint
                totalPontosXP += pontosXP; // Acumula pontos XP
            });

            ranking.push({
                nome: user.eva_name,
                totalPontosEVA: totalPontosEVA,
                totalPontosXP: totalPontosXP,
                pontosPorSprint: pontosPorSprint
            });
        }

        ranking.sort((a, b) => b.totalPontosXP - a.totalPontosXP); // Ordena o ranking por total de pontos XP

        ranking.forEach((userInRaking, index) => {
            userInRaking.posicao = index + 1; // Define a posição no ranking
        });

        return ranking; // Retorna o ranking
    } catch (error) {
        console.error('Erro ao calcular ranking com sprints:', error); // Loga erro no cálculo do ranking
        throw error; // Lança o erro
    }
}
