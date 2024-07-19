
const axios = require('axios'); // Importa a biblioteca axios para fazer requisições HTTP
const Parse = require('parse/node'); // Importa o SDK do Parse

/**
 * Pega do Back4App os usuarios e retorna suas informacoes
 * @returns um array de usuarios
 */
async function fetchStoredUsers() {
    try {
        // Define a classe 'usuario' no Parse
        const Usuario = Parse.Object.extend('usuario');
        // Cria uma nova consulta para a classe 'usuario'
        const query = new Parse.Query(Usuario);
        // Executa a consulta para obter todos os usuários armazenados
        const results = await query.find();
        // Mapeia os resultados para um array de objetos contendo os IDs e nomes dos usuários
        const storedUsers = results.map(result => ({
            id: result.get('ID'),
            nome: result.get('Nome')
        }));
        return storedUsers; // Retorna o array de usuários armazenados
    } catch (error) {
        // Exibe um erro no console se ocorrer um problema ao buscar os usuários
        console.error('Erro ao buscar usuários armazenados:', error);
        throw error; // Lança o erro para ser tratado em outro lugar
    }
}

// Exporta a função fetchStoredUsers para ser utilizada em outros módulos
module.exports = { fetchStoredUsers };
