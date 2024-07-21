// Importações de módulos
const { getUsersFromAPI } = require('../util/apiUtil'); // Função para obter usuários da API externa
const { userExistsAndUpdate } = require('../repository/UsuarioRepository');
const { consoleOccinho } = require("../util/ConsoleOccinho"); // Função para verificar e atualizar usuários no repositório

// Função assíncrona para adicionar usuários ao Back4App
async function addUsersToBack4App(authTokenEva) {
    try {
        consoleOccinho?.time("getUsersFromAPI");
        const users = await getUsersFromAPI(authTokenEva); // Obtém usuários da API externa
        consoleOccinho?.timeEnd("getUsersFromAPI");
        if (!Array.isArray(users)) {
            throw new Error('A resposta da API não é um array'); // Lança um erro se a resposta não for um array
        }

        const userPromises = users.map(user => userExistsAndUpdate(user)); // Mapeia os usuários para verificar ou atualizar no repositório
        consoleOccinho?.time("executar as verificacoes e atualizacoes de usuarios em paralelo")
        const results = await Promise.all(userPromises); // Executa todas as operações de verificação/atualização em paralelo
        consoleOccinho?.timeEnd("executar as verificacoes e atualizacoes de usuarios em paralelo")
        return results.filter(result => result !== null); // Retorna resultados que não sejam nulos (indicando sucesso na atualização)
    } catch (error) {
        console.error('(Service Usuario) Erro ao adicionar ou atualizar usuários:', error); // Registra erros ocorridos durante o processo
        throw error; // Lança o erro para tratamento externo
    }
}

module.exports = { addUsersToBack4App }; // Exporta a função para utilização externa
