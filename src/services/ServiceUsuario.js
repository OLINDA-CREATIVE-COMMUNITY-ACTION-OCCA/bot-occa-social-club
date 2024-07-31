// Importações de módulos
import { getUsersFromAPI } from '../util/apiUtil.js'; // Função para obter usuários da API externa
import { userExistsAndUpdate } from '../repository/UsuarioRepository.js';
import consoleOccinho  from "../util/ConsoleOccinho.js";
import User from "../models/User.js"; // Função para verificar e atualizar usuários no repositório

/**
 *
 * @param authTokenEva
 * @returns {Promise<Awaited<unknown>[]>}
 */
export async function addOrUpdateUsersToDatabase(authTokenEva) {
    try {
        const users = await getUsersFromAPI(authTokenEva); // Obtém usuários da API externa
        if (!Array.isArray(users)) {
            throw new Error('A resposta da API não é um array'); // Lança um erro se a resposta não for um array
        }
        consoleOccinho?.time("tempo para pegar todos os Usuários no banco é:")
        const storedUsers = await User.findAll();
        consoleOccinho?.timeEnd("tempo para pegar todos os Usuários no banco é:")

        const userPromises = users.map(user => userExistsAndUpdate(user, storedUsers)); // Mapeia os usuários para verificar ou atualizar no repositório
        consoleOccinho?.time("executar as verificacoes e atualizacoes de usuarios em paralelo")
        const results = await Promise.all(userPromises); // Executa todas as operações de verificação/atualização em paralelo
        consoleOccinho?.timeEnd("executar as verificacoes e atualizacoes de usuarios em paralelo")
        return results.filter(result => result !== null); // Retorna resultados que não sejam nulos (indicando sucesso na atualização)
    } catch (error) {
        console.error('(Service User) Erro ao adicionar ou atualizar usuários:', error); // Registra erros ocorridos durante o processo
        throw error; // Lança o erro para tratamento externo
    }
}

