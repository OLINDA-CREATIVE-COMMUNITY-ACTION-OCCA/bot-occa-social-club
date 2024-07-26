const { fetchStoredUsers } = require("../models/Usuario");
const { consoleOccinho } = require("../util/ConsoleOccinho");
const { extractNegotiationModel } = require("./ServiceDescription");

/**
 *  Função para calcular pontos EVA com base no título do projeto
 * @param {string} titulo
 * @returns
 */
async function calcularPontosEVA(task, user) {
    const negotiateTitleRegex = /\[(G|I|N):\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)\]/i;
    const match = task.titulo.match(negotiateTitleRegex);
    
    if (match) {
        const taskTotalPoints = getTaskTotalPoints(task.titulo);
        switch (match[1].toUpperCase()) {
            case "G":
                return taskTotalPoints; // Exemplo: Tarefa do tipo 'G' vale 8 pontos EVA
            case "I":
                return taskTotalPoints; // Exemplo: Tarefa do tipo 'I' vale 4 pontos EVA
            case "N":
                try {
                    const negotiationModel = extractNegotiationModel(task.descricao);
                    if (negotiationModel !== '') {
                        if (await validateNegociation(task)) {
                            const points = getNegotiationsPointsForUser(negotiationModel, user.nome);
                            consoleOccinho?.log("points = ", points);
                            return points; // Exemplo: Tarefa do tipo 'N' vale 2 pontos EVA 
                        } else {
                            console.log("ERRO! A divisão de pontos está maior que a pontuação total da tarefa.")
                        }
                    } else {
                        console.log(`A Tarefa: ${task.titulo} ainda não foi negociada!!!`);
                    }
                } catch (error) {
                    console.error(error)
                }
            default:
                return 0; // Retorna 0 pontos EVA se não houver correspondência
        }
    }

    return 0; // Retorna 0 pontos EVA se não encontrar correspondência
}

/**
 * 
 * @param {*} model string com o modelo de negociação
 * @param {*} evaUserName nome do usuário em eva
 * @returns quantos pontos o usuário recebeu em certa negociação
 */
function getNegotiationsPointsForUser(model, evaUserName) {
    consoleOccinho?.log("model =", model);
    const usersAndPoints = model.split(",");
    const regexFullNameEva = /[a-zA-Z\u00C0-\u017F]+( [a-zA-Z\u00C0-\u017F]+)+/;
    const regexDigit = /\d+/
    for (const userAndPoints of usersAndPoints) {
        consoleOccinho?.log(userAndPoints)
        const name = userAndPoints.split(":")[1].match(regexFullNameEva)[0];

        if (name.toLowerCase() == evaUserName.toLowerCase()) {
            const points = userAndPoints.split(":")[0].match(regexDigit)[0];
            return parseInt(points);
        }
    }

    throw Error(`Utilizando o model = ${model} e com o nome de usuário ${evaUserName} não foi possível atribuir pontos de negociação`)
}

function getTaskTotalPoints(taskTitle) {
    const titleRegex = /\[(G|I|N):\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)\]/i;
    const match = taskTitle.match(titleRegex);
    try {
        const pontos = parseInt(match[2], 10); // Extrai o número de pontos do título
        const multiplicador = parseFloat(match[3]); // Extrai o multiplicador do título
        const taskTotalPoints = pontos * multiplicador;
        return taskTotalPoints;
    } catch (err) {
        console.log(`Erro no tipo de tarefa no titulo: ${err}`);
        return 0;
    }
}

async function validateNegociation(task) {
    const taskTotalpoints = getTaskTotalPoints(task.titulo);
    const users = await fetchStoredUsers();
    const usersAssigners = [];
    const usersTotalPoints = [];
    const negotiationModel = extractNegotiationModel(task.descricao);
    const assinantes = task.assinantes.split(", ");

    for (let idUser of assinantes) {
        const userName = users.find((user) => user.id == idUser);
        usersAssigners.push(userName.nome);
    }

    for (let user of usersAssigners) {
        const userNegotiatePoints = getNegotiationsPointsForUser(negotiationModel, user);
        usersTotalPoints.push(userNegotiatePoints);
    }

    const totalNegotiatePoints = usersTotalPoints.reduce((totalPoints, userPoint) => totalPoints + userPoint, 0);

    if (totalNegotiatePoints > taskTotalpoints) {
        return false
    } else {
        return true
    }
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
