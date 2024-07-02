require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const axios = require('axios'); // Importa a biblioteca axios para fazer requisições HTTP
const Parse = require('parse/node'); // Importa o SDK do Parse

async function getStoredSprints() {
    // Define a classe 'sprint' no Parse
    const Sprint = Parse.Object.extend('sprint');
    // Cria uma nova consulta para a classe 'sprint'
    const query = new Parse.Query(Sprint);
    // Executa a consulta para obter todas as sprints armazenadas
    const results = await query.find();
    // Mapeia os resultados para um array contendo apenas os slugs das sprints
    return results.map(sprint => sprint.get('slug'));
}

// Exporta a função getStoredSprints para ser utilizada em outros módulos
module.exports = { getStoredSprints };
