import axios from 'axios'; // Importa o módulo axios para fazer requisições HTTP
import dotenv from 'dotenv'; // Carrega as variáveis de ambiente do arquivo .env


/**
 * Função assíncrona para obter usuários da API do EVA
 * @returns um json do eva com os dados dos usuários
 */
export async function getUsersFromAPI(authTokenEva) {
    dotenv.config()
    try {
        const response = await axios.get(`https://apiprodution.evastrategy.com/api/v1/users`, {
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
