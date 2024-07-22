const { consoleOccinho } = require("../util/ConsoleOccinho");
const { extractNegotiationModel } = require("./ServiceDescription");

/**
 *  Função para calcular pontos EVA com base no título do projeto
 * @param {string} titulo
 * @returns
 */
function calcularPontosEVA(task, user) {
  const negotiateTitleRegex = /\[(G|I|N):\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)\]/i;
  const match = task.titulo.match(negotiateTitleRegex);

  if (match) {
    const pontos = parseInt(match[2], 10); // Extrai o número de pontos do título
    const multiplicador = parseFloat(match[3]); // Extrai o multiplicador do título

    switch (match[1].toUpperCase()) {
      case "G":
        return pontos * multiplicador; // Exemplo: Tarefa do tipo 'G' vale 8 pontos EVA
      case "I":
        return pontos * multiplicador; // Exemplo: Tarefa do tipo 'I' vale 4 pontos EVA
      case "N":
        const negotiationModel = extractNegotiationModel(task.descricao);
        consoleOccinho?.log(getNegotiationsPoints(negotiationModel));
        const points = getNegotiationsPoints(negotiationModel, user.nome);
        return points; // Exemplo: Tarefa do tipo 'N' vale 2 pontos EVA
      default:
        return 0; // Retorna 0 pontos EVA se não houver correspondência
    }
  }

  return 0; // Retorna 0 pontos EVA se não encontrar correspondência
}

/**
 * 
 * @param {*} model string com o modelo de negociação
 * @param {*} eva_user_name nome do usuário em eva
 * @returns quantos pontos o usuário recebeu em certa negociação
 */
function getNegotiationsPoints(model, eva_user_name) {
    consoleOccinho?.log("model =", model);
  const usersAndPoints = model.split(",");
  const regexFullNameEva = /[a-zA-Z\u00C0-\u017F]+( [a-zA-Z\u00C0-\u017F]+)+/;
  const regexDigit = /\d+/
  for (const userAndPoints of usersAndPoints) {
    consoleOccinho?.log(userAndPoints)
    const name = userAndPoints.split(":")[1].match(regexFullNameEva)[0];

    if(name == eva_user_name) {
        const points = userAndPoints.split(":")[0].match(regexDigit)[0];
        return points
    }
  }
  return -1;
}

/**
 * Função para calcular pontos XP com base na fórmula fornecida
 * @param {*} pontosEVA
 * @param {*} mediaPontosEVA
 * @param {*} numeroSprintsParticipadas
 * @returns
 */
function calcularPontosXP(
  pontosEVA,
  mediaPontosEVA,
  numeroSprintsParticipadas
) {
  // Calcula pontos XP com base nos parâmetros fornecidos
  if (numeroSprintsParticipadas >= 3 && mediaPontosEVA >= 16) {
    return pontosEVA * 30; // Se participou de 3 ou mais sprints e média de pontos EVA >= 16
  } else if (numeroSprintsParticipadas >= 3 && mediaPontosEVA < 16) {
    // Fórmula modificada para médiaPontosEVA < 16
    return (16 - mediaPontosEVA) ** 1 * -pontosEVA + pontosEVA * 30;
  } else {
    // Primeira e segunda sprint, 1 pontoEVA equivale a 30 XP
    return pontosEVA * 30;
  }
}

module.exports = {
  calcularPontosEVA,
  calcularPontosXP,
};
