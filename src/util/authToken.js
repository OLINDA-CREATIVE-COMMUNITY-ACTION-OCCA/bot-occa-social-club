const axios = require('axios'); // Importa o módulo axios para fazer requisições HTTP
const { consoleOccinho } = require('./ConsoleOccinho');


/**
 * Essa função pega o token de autoriazação do eva e precisa ser chamada logo no inicio do index.js
 * @param {string} user nome de usuário do EVA
 * @param {string} password senha do EVA
 */
async function getAuthToken(user, password) {
    try {
        const response = await axios.post('https://apiproduction.evastrategy.com/api/v1/auth', {
            "password": `${password}`,
            "type": "normal",
            "username": `${user}`
        });
        const authTokenEva = response.data.auth_token
        consoleOccinho?.log(authTokenEva);
        return authTokenEva
    } catch (error) {
        console.error('Erro ao tentar pegar o Token:', error)
        throw error;
    }
}

module.exports = { getAuthToken };