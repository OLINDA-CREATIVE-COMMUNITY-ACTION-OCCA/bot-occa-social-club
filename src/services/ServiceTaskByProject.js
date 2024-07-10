// projectService.js

// Importações de módulos e configuração inicial
const axios = require('axios'); // Para requisições HTTP
const Parse = require('parse/node'); // Para interação com o Parse Server
const { getStoredTasksByProjects, getStoredSprints, fetchStoredUsers } = require('../repository/projetotRepository'); // Funções de acesso aos dados armazenados
const { convertAssignerIdsToNames, getAssignerNames, convertAssignerNameToId } = require('../services/ServiceNameID'); // Funções de conversão de IDs para nomes e vice-versa
const { sprintNameMap, statusMap } = require('../services/ServiceSprint'); // Mapeamentos de nomes de sprint e status
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

/**
 * Função assíncrona para adicionar ou atualizar projetos no Back4App
 * @returns log de alteração realizada
 */
async function addOrUpdateTaskByProjectsToBack4App() {
    /**
     * Array que registra atualizações de nome dos usuários, dos status de uma tarefa ou dos assinantes da tarefa
     * @type {*[string]}
     */
    let changesLog = []; // Array para registrar alterações realizadas

    try {
        // Obtenção de sprints e projetos armazenados e usuários do Parse
        const storedSprints = await getStoredSprints();
        const tasksByProjects = await getStoredTasksByProjects();
        const storedUsers = await fetchStoredUsers();

        // Requisição para obter os marcos (milestones) da API externa
        const milestonesResponse = await axios.get('https://apiproduction.evastrategy.com/api/v1/milestones', {
            headers: {
                'Authorization': `Bearer ${process.env.API_AUTHORIZATION_TOKEN}` // Token de autorização da API
            }
        });

        const milestones = milestonesResponse.data; // Array de marcos recebidos da API

        // Iteração sobre cada marco recebido da API
        for (const milestone of milestones) {
            const sprintName = sprintNameMap[milestone.slug] || milestone.name; // Nome da sprint mapeado ou nome padrão do marco
            const tasksResponse = await axios.get(`https://apiproduction.evastrategy.com/api/v1/tasks?milestone=${milestone.id}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.API_AUTHORIZATION_TOKEN}` // Token de autorização da API
                }
            });

            const tasks = tasksResponse.data; // Array de projetos recebidos da API

            if (!Array.isArray(tasks)) {
                throw new Error('A resposta da API não é um array'); // Lança um erro se a resposta não for um array
            }

            // Iteração sobre cada projeto recebido da API
            for (const task of tasks) {
                if (task.subject === 'teste') {
                    console.log(`Projeto ${task.subject} ignorado.`); // Ignora projetos de teste com o assunto 'teste'
                    continue;
                }

                // Obtém nomes dos assinantes e IDs dos assinantes
                const assignersNames = getAssignerNames(task.assigners, storedUsers);
                const assignersIds = convertAssignerNameToId(assignersNames.split(', '), storedUsers);
                const existingTaskByProject = tasksByProjects.find(taskInDataBase =>
                    taskInDataBase.titulo === task.subject
                ); // Busca por projeto existente pelo título

                // Verifica se a tarefa já existe no armazenamento
                if (existingTaskByProject) {
                    let changed = false; // Flag para indicar se houve alterações
                    let changeDetails = `Projeto ${task.subject} atualizado:`; // Detalhes das alterações realizadas

                    const existingAssignerIds = existingTaskByProject.assinantes; // IDs de assinantes existentes no projeto

                    // Verifica e atualiza o status do projeto se necessário
                    if (existingTaskByProject.status !== statusMap[task.status]) {
                        changeDetails += `\n  - Status: de "${existingTaskByProject.status}" para "${statusMap[task.status]}"`;
                        existingTaskByProject.status = statusMap[task.status];
                        changed = true;
                    }

                    // Verifica e atualiza a sprint do projeto se necessário
                    if (existingTaskByProject.sprint !== sprintName) {
                        changeDetails += `\n  - Sprint: de "${existingTaskByProject.sprint}" para "${sprintName}"`;
                        existingTaskByProject.sprint = sprintName;
                        changed = true;
                    }

                    // Verifica e atualiza os assinantes do projeto se necessário
                    if (existingAssignerIds !== assignersIds) {
                        const oldAssignerNames = convertAssignerIdsToNames(existingAssignerIds, storedUsers);
                        const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);

                        changeDetails += `\n  - Assinantes: de "${oldAssignerNames}" para "${newAssignerNames}"`;
                        existingTaskByProject.assinantes = assignersIds;
                        changed = true;
                    }

                    // Se houver alterações, atualiza o projeto no Parse
                    if (changed) {
                        const taskByProjectToUpdate = new Parse.Query(Parse.Object.extend('projeto'));
                        const taskByProjectObject = await taskByProjectToUpdate.get(existingTaskByProject.id);

                        taskByProjectObject.set('status', existingTaskByProject.status);
                        taskByProjectObject.set('sprint', existingTaskByProject.sprint);
                        taskByProjectObject.set('assinantes', assignersIds);
                        await taskByProjectObject.save(); // Salva as alterações no projeto
                        changesLog.push(changeDetails); // Registra as alterações no log de mudanças
                    }
                } else {
                    // Se o tarefa realacionada ao projeto não existir, cria um novo no Parse
                    const TaskByProjectClass = Parse.Object.extend('projeto');
                    const newTaskByProject = new TaskByProjectClass();

                    newTaskByProject.set('titulo', task.subject);
                    newTaskByProject.set('status', statusMap[task.status]);
                    newTaskByProject.set('sprint', sprintName);
                    newTaskByProject.set('assinantes', assignersIds);
                    await newTaskByProject.save(); // Salva o novo projeto no Parse

                    const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);
                    changesLog.push(`Novo projeto adicionado: ${task.subject}\n  - Assinantes: ${newAssignerNames}`); // Registra o novo projeto no log de mudanças
                }
            }
        }

        if (changesLog.length === 0) {
            changesLog.push('Nenhum projeto foi adicionado ou atualizado.'); // Se não houver alterações, registra no log
        }

        return changesLog; // Retorna o log de alterações realizadas
    } catch (error) {
        console.error('Erro ao adicionar ou atualizar projetos:', error); // Registra erros ocorridos durante o processo
        throw error; // Lança o erro para tratamento externo
    }
}

module.exports = { addOrUpdateTaskByProjectsToBack4App: addOrUpdateTaskByProjectsToBack4App }; // Exporta a função para utilização externa
