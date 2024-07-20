require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const axios = require('axios'); // Importa a biblioteca axios para fazer requisições HTTP
const Parse = require('parse/node'); // Importa o SDK do Parse

/**
 * Pega do Back4App todas as tarefas de um projeto, com os campos que sao relevantes
 * @returns um array de todas as tarefas do projeto
 */
async function getStoredTasksByProjects() {
    // Define a classe 'projeto' no Parse
    const Project = Parse.Object.extend('projeto');
    // Cria uma nova consulta para a classe 'projeto'
    const query = new Parse.Query(Project);
    // Executa a consulta para obter todos os projetos armazenados
    const results = await query.find();
    // Mapeia os resultados para um formato mais conveniente
    return results.map(tarefa => ({
        id: tarefa.id,
        titulo: tarefa.get('titulo'),
        status: tarefa.get('status'),
        sprint: tarefa.get('sprint'),
        assinantes: tarefa.get('assinantes'),
        descricao: tarefa.get('descricao')
    }));
}

// Exporta a função getStoredTasksByProjects para ser utilizada em outros módulos
module.exports = { getStoredTasksByProjects: getStoredTasksByProjects };
