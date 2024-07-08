// Importa as funções necessárias do arquivo ServicePontos
const { calcularPontosEVA, calcularPontosXP } = require('./ServicePontos');

// Importa os mapas de nome de sprint e status do arquivo ServiceSprint
const { sprintNameMap, statusMap } = require('./ServiceSprint');


/**
 * Função principal para calcular o ranking com base nos projetos armazenados e usuários
 * @param {*} storedProjects 
 * @param {*} storedUsers 
 * @returns 
 */
function calcularRanking(storedProjects, storedUsers) {
    // Inicializa o array de ranking
    const ranking = [];

    // Itera sobre cada usuário armazenado
    storedUsers.forEach(user => {
        // Inicializa um objeto para armazenar pontos por sprint
        const pontosPorSprint = {};
        let numeroSprintsParticipadas = 0;
        let totalPontosEVA = 0;
        let totalPontosXP = 0;

        // Itera sobre cada projeto armazenado
        storedProjects.forEach(project => {
            // Verifica se o usuário é assinante do projeto e se o projeto está concluído
            if (project.assinantes.includes(user.id) && project.status === 'Concluído') {
                // Calcula os pontos EVA para o projeto atual
                const pontosEVA = calcularPontosEVA(project.titulo);

                // Adiciona os pontos ao sprint correspondente
                if (!pontosPorSprint[project.sprint]) {
                    pontosPorSprint[project.sprint] = {
                        pontosEVA: pontosEVA,
                        pontosXP: 0
                    };
                } else {
                    pontosPorSprint[project.sprint].pontosEVA += pontosEVA;
                }

                // Incrementa o número de sprints participadas
                numeroSprintsParticipadas++;
            }
        });

        // Ordena os sprints por número
        const sprints = Object.keys(pontosPorSprint);
        sprints.sort((a, b) => {
            const matchA = a.match(/\d+/);
            const matchB = b.match(/\d+/);
            const sprintNumA = matchA ? parseInt(matchA[0], 10) : 1000;
            const sprintNumB = matchB ? parseInt(matchB[0], 10) : 1000;
            return sprintNumA - sprintNumB;
        });

        // Calcula os pontos XP com base nos pontos EVA e nas regras de cálculo
        sprints.forEach((sprint, index) => {
            const pontosEVA = pontosPorSprint[sprint].pontosEVA;
            totalPontosEVA += pontosEVA;

            let mediaPontosEVA = 0;
            let pontosXP = 0;

            // Regras de conversão de pontos EVA para pontos XP
            if (index === 0 || index === 1) {
                pontosXP = pontosEVA * 30;
            } else if (index >= 2) {
                const pontosEVAAtual = pontosPorSprint[sprint].pontosEVA;
                const pontosEVAPassada = pontosPorSprint[sprints[index - 1]].pontosEVA;
                const pontosEVAPenultima = pontosPorSprint[sprints[index - 2]].pontosEVA;

                mediaPontosEVA = (pontosEVAAtual + pontosEVAPassada + pontosEVAPenultima) / 3;
                pontosXP = calcularPontosXP(pontosEVA, mediaPontosEVA, numeroSprintsParticipadas);
            }

            pontosPorSprint[sprint].pontosXP = pontosXP;
            totalPontosXP += pontosXP;
        });

        // Adiciona os dados calculados do usuário ao ranking
        ranking.push({
            nome: user.nome,
            totalPontosEVA: totalPontosEVA,
            totalPontosXP: totalPontosXP,
            pontosPorSprint: pontosPorSprint
        });
    });

    // Ordena o ranking com base nos pontos XP totais
    ranking.sort((a, b) => b.totalPontosXP - a.totalPontosXP);

    // Atribui a posição no ranking para cada usuário
    ranking.forEach((user, index) => {
        user.posicao = index + 1;
    });

    return ranking;
}

// Exporta a função calcularRanking para uso em outros módulos
module.exports = { calcularRanking };
