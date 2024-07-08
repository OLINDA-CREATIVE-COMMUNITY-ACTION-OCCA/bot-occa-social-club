const axios = require('axios'); // Importa o módulo axios para fazer requisições HTTP
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

/**
 * Função assíncrona para obter usuários da API externa
 * @returns um json do eva com os dados dos usuários
 */
async function getUsersFromAPI() {
    try {
        const response = await axios.get('https://apiproduction.evastrategy.com/api/v1/users', {
            headers: {
                'Authorization': `Bearer ${process.env.API_AUTHORIZATION_TOKEN}` // Define o token de autorização no cabeçalho da requisição
            }
        });
        return response.data; // Retorna os dados da resposta da API
    } catch (error) {
        console.error('Erro ao buscar usuários da API:', error); // Registra um erro se houver problemas na requisição
        throw error; // Lança o erro para tratamento externo
    }
}

module.exports = { getUsersFromAPI }; // Exporta a função para utilização externa
