/**
 *  Função para calcular pontos EVA com base no título do projeto
 * @param {string} titulo 
 * @returns 
 */
function calcularPontosEVA(titulo) {
    const regex = /\[(G|I|N):\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)\]/i;
    const match = titulo.match(regex);

    if (match) {
        const pontos = parseInt(match[2], 10); // Extrai o número de pontos do título
        const multiplicador = parseFloat(match[3]); // Extrai o multiplicador do título

        switch (match[1].toUpperCase()) {
            case 'G':
                return pontos * multiplicador * 1; // Exemplo: Tarefa do tipo 'G' vale 8 pontos EVA
            case 'I':
                return pontos * multiplicador * 1; // Exemplo: Tarefa do tipo 'I' vale 4 pontos EVA
            case 'N':
                return pontos * multiplicador * 1; // Exemplo: Tarefa do tipo 'N' vale 2 pontos EVA
            default:
                return 0; // Retorna 0 pontos EVA se não houver correspondência
        }
    }

    return 0; // Retorna 0 pontos EVA se não encontrar correspondência
}

/**
 * Função para calcular pontos XP com base na fórmula fornecida
 * @param {*} pontosEVA 
 * @param {*} mediaPontosEVA 
 * @param {*} numeroSprintsParticipadas 
 * @returns 
 */
function calcularPontosXP(pontosEVA, mediaPontosEVA, numeroSprintsParticipadas) {
    // Calcula pontos XP com base nos parâmetros fornecidos
    if (numeroSprintsParticipadas >= 3 && mediaPontosEVA >= 16) {
        return pontosEVA * 30; // Se participou de 3 ou mais sprints e média de pontos EVA >= 16
    } else if (numeroSprintsParticipadas >= 3 && mediaPontosEVA < 16) {
        // Fórmula modificada para médiaPontosEVA < 16
        return ((16 - mediaPontosEVA) ** 1) * -pontosEVA + (pontosEVA * 30);
    } else {
        // Primeira e segunda sprint, 1 pontoEVA equivale a 30 XP
        return pontosEVA * 30;
    }
}

module.exports = {
    calcularPontosEVA,
    calcularPontosXP
};
