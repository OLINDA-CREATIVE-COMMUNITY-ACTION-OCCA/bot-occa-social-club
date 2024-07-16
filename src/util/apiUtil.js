const axios = require('axios'); // Importa o módulo axios para fazer requisições HTTP
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const { consoleOccinho } = require('./ConsoleOccinho');

/**
 * Função assíncrona para obter usuários da API do EVA
 * @returns um json do eva com os dados dos usuários
 */
async function getUsersFromAPI(authTokenEva) {
    try {
        consoleOccinho?.log(`${authTokenEva}`)
        consoleOccinho?.log(`getUsersFromApi ${'' == authTokenEva}`)
        authTokenEva.then
        const response = await axios.get('https://apiproduction.evastrategy.com/api/v1/users', {
            headers: {
                'Authorization': `Bearer  ${authTokenEva}` // Define o token de autorização no cabeçalho da requisição
            }
        });
        return response.data; // Retorna os dados da resposta da API
    } catch (error) {
        console.error('Erro ao buscar usuários da API:', error); // Registra um erro se houver problemas na requisição
        throw error; // Lança o erro para tratamento externo
    }
}

module.exports = { getUsersFromAPI }; // Exporta a função para utilização externa
