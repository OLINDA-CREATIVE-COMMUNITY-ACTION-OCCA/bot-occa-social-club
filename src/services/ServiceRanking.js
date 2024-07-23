// Importa as funções necessárias do arquivo ServicePontos
const { calcularPontosEVA, calcularPontosXP } = require("./ServicePontos");

// Importa os mapas de nome de sprint e status do arquivo ServiceSprint
const { sprintNameMap, statusMap } = require("./ServiceSprint");

/**
 * Função principal para calcular o ranking com base nos projetos armazenados e usuários
 * @param {*} storedProjects
 * @param {*} storedUsers
 * @returns
 */
function calcularRanking(storedProjects, storedUsers) {
  // Inicializa o array de ranking
  const ranking = [];

  // Inicializa um Map para armazenar pontos por usuário e sprint
  const pontosPorUsuario = new Map();

  // Itera sobre cada projeto armazenado
  storedProjects.forEach((task) => {
    // Verifica se o projeto está concluído
    if (task.status === "Concluído") {
      const pontosEVA = 0;

      // Itera sobre cada assinante do projeto
      task.assinantes.forEach((userId) => {
        const user = storedUsers.find((user) => user.id == userId);
        pontosEVA = calcularPontosEVA(task, user);

        if (!pontosPorUsuario.has(userId)) {
          pontosPorUsuario.set(userId, {
            pontosPorSprint: new Map(),
            totalPontosEVA: 0,
            totalPontosXP: 0,
            numeroSprintsParticipadas: 0,
          });
        }

        const userPoints = pontosPorUsuario.get(userId);

        if (!userPoints.pontosPorSprint.has(task.sprint)) {
          userPoints.pontosPorSprint.set(task.sprint, {
            pontosEVA: 0,
            pontosXP: 0,
          });
          userPoints.numeroSprintsParticipadas++;
        }

        userPoints.pontosPorSprint.get(task.sprint).pontosEVA += pontosEVA;
        userPoints.totalPontosEVA += pontosEVA;
      });
    }
  });

  // Calcula pontos XP para cada usuário
  pontosPorUsuario.forEach((userPoints, userId) => {
    const sprints = Array.from(userPoints.pontosPorSprint.keys());
    sprints.sort((a, b) => {
      const matchA = a.match(/\d+/);
      const matchB = b.match(/\d+/);
      const sprintNumA = matchA ? parseInt(matchA[0], 10) : 1000;
      const sprintNumB = matchB ? parseInt(matchB[0], 10) : 1000;
      return sprintNumA - sprintNumB;
    });

    sprints.forEach((sprint, index) => {
      const pontosEVA = userPoints.pontosPorSprint.get(sprint).pontosEVA;
      let pontosXP = 0;

      if (index < 2) {
        pontosXP = pontosEVA * 30;
      } else {
        const pontosEVAAtual = pontosEVA;
        const pontosEVAPassada = userPoints.pontosPorSprint.get(
          sprints[index - 1]
        ).pontosEVA;
        const pontosEVAPenultima = userPoints.pontosPorSprint.get(
          sprints[index - 2]
        ).pontosEVA;
        const mediaPontosEVA =
          (pontosEVAAtual + pontosEVAPassada + pontosEVAPenultima) / 3;

        pontosXP = calcularPontosXP(
          pontosEVA,
          mediaPontosEVA,
          userPoints.numeroSprintsParticipadas
        );
      }

      userPoints.pontosPorSprint.get(sprint).pontosXP = pontosXP;
      userPoints.totalPontosXP += pontosXP;
    });

    ranking.push({
      nome: storedUsers.find((user) => user.id === userId).nome,
      totalPontosEVA: userPoints.totalPontosEVA,
      totalPontosXP: userPoints.totalPontosXP,
      pontosPorSprint: Object.fromEntries(userPoints.pontosPorSprint),
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
