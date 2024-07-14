const axios = require('axios'); // Importa o módulo axios para fazer requisições HTTP
const { consoleOccinho } = require('./ConsoleOccinho');

async function getAuthToken(user, password) {
    try {
        const response = await axios.post('https://apiproduction.evastrategy.com/api/v1/auth', {
            "password": `${password}`,
            "type": "normal",
            "username": `${user}`
        });

        // consoleOccinho?.log(response.data.auth_token);
        return response.data.auth_token;
    } catch (error) {
        console.error('Erro ao tentar pegar o Token:', error)
        throw error;
    }
}

module.exports = { getAuthToken };