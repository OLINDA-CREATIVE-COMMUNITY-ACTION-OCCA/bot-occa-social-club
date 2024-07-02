require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const axios = require('axios'); // Importa a biblioteca axios para fazer requisições HTTP
const Parse = require('parse/node'); // Importa o SDK do Parse

async function getStoredProjects() {
    // Define a classe 'projeto' no Parse
    const Project = Parse.Object.extend('projeto');
    // Cria uma nova consulta para a classe 'projeto'
    const query = new Parse.Query(Project);
    // Executa a consulta para obter todos os projetos armazenados
    const results = await query.find();
    // Mapeia os resultados para um formato mais conveniente
    return results.map(project => ({
        id: project.id, // ID do projeto
        titulo: project.get('titulo'), // Título do projeto
        status: project.get('status'), // Status do projeto
        sprint: project.get('sprint'), // Sprint do projeto
        assinantes: project.get('assinantes') // Assinantes do projeto
    }));
}

// Exporta a função getStoredProjects para ser utilizada em outros módulos
module.exports = { getStoredProjects };
