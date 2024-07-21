// ServiceDescription.js

/**
 * Remove URLs de um texto.
 * @param {string} text - O texto a ser processado.
 * @returns {string} - O texto sem URLs.
 */
function removeUrls(text) {
    return text.replace(/https?:\/\/[^\s]+/g, '');
}

/**
 * Formata a descrição, removendo URLs e adicionando mensagem sobre o modelo de negociação.
 * @param {string} description - A descrição original da tarefa.
 * @param {boolean} hasNegotiationModel - Se a descrição contém o modelo de negociação.
 * @returns {string} - A descrição formatada.
 */
function formatDescription(description, hasNegotiationModel) {
    const descriptionWithoutUrls = removeUrls(description);
    const modelMessage = hasNegotiationModel ? 'Modelo de negociação presente.' : 'Modelo de negociação não presente.';
    return `${descriptionWithoutUrls}\n${modelMessage}`;
}

/**
 * Extrai a parte da descrição que corresponde ao modelo de negociação.
 * @param {string} description - A descrição da tarefa.
 * @param {RegExp} regex - A expressão regular para encontrar o modelo de negociação.
 * @returns {string} - A parte da descrição que corresponde ao modelo de negociação.
 */
function extractDescriptionModel(description, regex) {
    const match = description.match(regex);
    return match ? match[0] : '';
}

module.exports = { removeUrls, formatDescription, extractDescriptionModel };
