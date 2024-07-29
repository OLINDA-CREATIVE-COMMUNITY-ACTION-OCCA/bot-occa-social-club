
/**
 * Remove URLs de um texto.
 * @param {string} text - O texto a ser processado.
 * @returns {string} - O texto sem URLs.
 */
export function removeUrls(text) {
    return text.replace(/https?:\/\/[^\s]+/g, '');
}

/**
 * Formata a descrição, removendo URLs e adicionando mensagem sobre o modelo de negociação.
 * @param {string} description - A descrição original da tarefa.
 * @param {boolean} hasNegotiationModel - Se a descrição contém o modelo de negociação.
 * @returns {string} - A descrição formatada.
 */
export function formatDescription(description, hasNegotiationModel) {
    const descriptionWithoutUrls = removeUrls(description);
    const modelMessage = hasNegotiationModel ? 'Modelo de negociação presente.' : 'Modelo de negociação não presente.';
    return `${descriptionWithoutUrls}\n${modelMessage}`;
}


/**
 * Extrai a parte da descrição que corresponde ao modelo de negociação.
 * @param {string} description - A descrição da tarefa.
 * @returns {string} - A parte da descrição que corresponde ao modelo de negociação.
 */
export function extractNegotiationModel(description) {
    const negotiationRegex = /\[N\s*=\s*\d+\s*:\s*[^,\]]+(?:,\s*N\s*=\s*\d+\s*:\s*[^,\]]+)*\]/;
    const match = description.match(negotiationRegex);
    return match ? match[0] : '';
}
