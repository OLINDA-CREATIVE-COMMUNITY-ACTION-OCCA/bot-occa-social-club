// Importações de módulos
const { getUsersFromAPI } = require('../util/apiUtil'); // Função para obter usuários da API externa
const { userExistsAndUpdate } = require('../repository/UsuarioRepository'); // Função para verificar e atualizar usuários no repositório

// Função assíncrona para adicionar usuários ao Back4App
async function addUsersToBack4App() {
    try {
        const users = await getUsersFromAPI(); // Obtém usuários da API externa

        if (!Array.isArray(users)) {
            throw new Error('A resposta da API não é um array'); // Lança um erro se a resposta não for um array
        }

        const userPromises = users.map(user => userExistsAndUpdate(user)); // Mapeia os usuários para verificar ou atualizar no repositório
        const results = await Promise.all(userPromises); // Executa todas as operações de verificação/atualização em paralelo
        return results.filter(result => result !== null); // Retorna resultados que não sejam nulos (indicando sucesso na atualização)
    } catch (error) {
        console.error('Erro ao adicionar ou atualizar usuários:', error); // Registra erros ocorridos durante o processo
        throw error; // Lança o erro para tratamento externo
    }
}

module.exports = { addUsersToBack4App }; // Exporta a função para utilização externa
