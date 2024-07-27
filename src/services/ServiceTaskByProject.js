// Importações de módulos e configuração inicial
const axios = require('axios'); // Para requisições HTTP
const Parse = require('parse/node'); // Para interação com o Parse Server
const { getStoredTasksByProjects, getStoredSprints, fetchStoredUsers } = require('../repository/projetotRepository'); // Funções de acesso aos dados armazenados
const { convertAssignerIdsToNames, getAssignerNames, convertAssignerNameToId } = require('../services/ServiceNameID'); // Funções de conversão de IDs para nomes e vice-versa
const { sprintNameMap, statusMap } = require('../services/ServiceSprint'); // Mapeamentos de nomes de sprint e status
const { consoleOccinho } = require('../util/ConsoleOccinho');
const {updateOrCreateTasks} = require("./updateOrCreateTasks");
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const logPath = "ServiceTaskByProject";

/**
 * Função assíncrona para adicionar ou atualizar projetos no Back4App
 * @returns log de alteração realizada
 */
async function addOrUpdateTasks(authTokenEva) {
    /**
     * Array que registra atualizações de nome dos usuários, dos status de uma tarefa ou dos assinantes da tarefa
     * @type {*[string]}
     */
    let changesLog = []; // Array para registrar alterações realizadas

    try {
        // Obtenção de sprints e projetos armazenados e usuários do Parse
        const [storedSprints, tasksFromDatabase, storedUsers] = await Promise.all([
            getStoredSprints(),
            getStoredTasksByProjects(),
            fetchStoredUsers()
        ]);

        consoleOccinho?.log(logPath, `token de eva é ${authTokenEva}`);
        // Requisição para obter os marcos (milestones) da API externa
        const milestonesResponse = await axios.get('https://apiproduction.evastrategy.com/api/v1/milestones', {
            headers: { 'Authorization': `Bearer ${authTokenEva}` } // Token de autorização da API
        });

        const milestones = milestonesResponse.data; // Array de marcos recebidos da API

        // Expressão regular para verificar se o título contém "[N: <número> X <número>] " com possíveis variações de espaços
        const regexNPrefix = /^\[\s*N\s*:\s*\d+\s*[Xx]\s*\d+\s*]\s?.*$/;
        // Expressão regular para capturar a parte relevante da descrição
        const regexDescriptionModel = /\[N\s*=\s*\d+\s*:\s*[^,\]]+(?:,\s*N\s*=\s*\d+\s*:\s*[^,\]]+)*\]/;

        // Iteração sobre cada marco recebido da API
        for (const milestone of milestones) {
            const sprintName = sprintNameMap[milestone.slug] || milestone.name; // Nome da sprint mapeado ou nome padrão do marco

            const tasksResponse = await axios.get(`https://apiproduction.evastrategy.com/api/v1/tasks?milestone=${milestone.id}`, {
                headers: { 'Authorization': `Bearer ${authTokenEva}` } // Token de autorização da API
            });

            const tasksFromAPI = tasksResponse.data; // Array de projetos recebidos da API

            if (!Array.isArray(tasksFromAPI)) {
                throw new Error('A resposta da API não é um array'); // Lança um erro se a resposta não for um array
            }
            await updateOrCreateTasks(
                tasksFromAPI,
                tasksFromDatabase,
                sprintName,
                storedUsers 
            );
        }
    } catch (error) {
        consoleOccinho?.log(logPath, `Erro ao obter tarefas por projeto: ${error.message}`); // Registra o erro
        changesLog.push(`Erro ao obter tarefas por projeto: ${error.message}`); // Adiciona o erro ao log de mudanças
    }

    // Exibe o log de mudanças
    changesLog.forEach(change => consoleOccinho?.log(logPath, change));

    return changesLog; // Retorna o log de mudanças
}

module.exports = { addOrUpdateTaskByProjectsToBack4App: addOrUpdateTasks }; // Exporta a função para uso externo
