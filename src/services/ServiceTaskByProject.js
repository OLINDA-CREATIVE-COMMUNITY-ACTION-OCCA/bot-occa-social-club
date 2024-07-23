// Importações de módulos e configuração inicial
const axios = require('axios'); // Para requisições HTTP
const Parse = require('parse/node'); // Para interação com o Parse Server
const { getStoredTasksByProjects, getStoredSprints, fetchStoredUsers } = require('../repository/projetotRepository'); // Funções de acesso aos dados armazenados
const { convertAssignerIdsToNames, convertAssignerNameToId } = require('../services/ServiceNameID'); // Funções de conversão de IDs para nomes e vice-versa
const { sprintNameMap, statusMap } = require('../services/ServiceSprint'); // Mapeamentos de nomes de sprint e status
const { removeUrls, formatDescription, extractDescriptionModel } = require('../services/ServiceDescription'); // Novas funções de descrição
const { consoleOccinho } = require('../util/ConsoleOccinho');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const logPath = "ServiceTaskByProject";

/**
 * Função assíncrona para adicionar ou atualizar projetos no Back4App
 * @returns log de alteração realizada
 */
async function addOrUpdateTaskByProjectsToBack4App(authTokenEva) {
    /**
     * Array que registra atualizações de nome dos usuários, dos status de uma tarefa ou dos assinantes da tarefa
     * @type {*[string]}
     */
    let changesLog = []; // Array para registrar alterações realizadas

    try {
        // Obtenção de sprints e projetos armazenados e usuários do Parse
        const [storedSprints, tasksByProjects, storedUsers] = await Promise.all([
            getStoredSprints(),
            getStoredTasksByProjects(),
            fetchStoredUsers()
        ]);

        // Requisição para obter os marcos (milestones) da API externa
        const { data: milestonesResponse } = await axios.get('https://apiproduction.evastrategy.com/api/v1/milestones', {
            headers: { 'Authorization': `Bearer ${authTokenEva}` } // Token de autorização da API
        });

        // Expressão regular para verificar se o título contém "[N: <número> X <número>] " com possíveis variações de espaços
        const regexNPrefix = /^\[\s*N\s*:\s*\d+\s*[Xx]\s*\d+\s*]\s?.*$/;
        // Expressão regular para capturar a parte relevante da descrição
        const regexDescriptionModel = /\[N\s*=\s*\d+\s*:\s*[^,\]]+(?:,\s*N\s*=\s*\d+\s*:\s*[^,\]]+)*\]/;

        const tasksByProjectMap = new Map(tasksByProjects.map(task => [task.titulo, task]));
        const storedUsersMap = new Map(storedUsers.map(user => [user.id.toString(), user]));
        const tasksBatch = [];

        // Processar milestonesResponse em paralelo
        await Promise.all(milestonesResponse.map(async milestone => {
            const sprintName = sprintNameMap[milestone.slug] || milestone.name; // Nome da sprint mapeado ou nome padrão do marco

            // Requisição para obter as tarefas do marco em paralelo
            const { data: tasks } = await axios.get(`https://apiproduction.evastrategy.com/api/v1/tasks?milestone=${milestone.id}`, {
                headers: { 'Authorization': `Bearer ${authTokenEva}` } // Token de autorização da API
            });

            await Promise.all(tasks.map(async task => {
                if (task.subject === 'teste' || task.subject === 'Estudar o codigo (front end) - NOME MEMBRO [8x1][Individual]') {
                    console.log(`Projeto ${task.subject} ignorado.`); // Ignora projetos de teste com o assunto 'teste'
                    return;
                }

                // Requisição adicional para obter a descrição da tarefa em paralelo
                const { data: taskDetail } = await axios.get(`https://apiproduction.evastrategy.com/api/v1/tasks/${task.id}`, {
                    headers: { 'Authorization': `Bearer ${authTokenEva}` } // Token de autorização da API
                });

                const fullDescription = taskDetail.description; // Obtém a descrição completa da tarefa
                const hasNegotiationModel = regexNPrefix.test(task.subject); // Verifica se o modelo de negociação está presente
                const formattedDescription = formatDescription(fullDescription, hasNegotiationModel); // Formata a descrição

                // Verifica e extrai o modelo de negociação se presente
                const negotiationModelPresent = regexDescriptionModel.test(fullDescription);

                const assignersNames = convertAssignerIdsToNames(task.assigners, storedUsersMap); // Obtém nomes dos assinantes
                const assignersIds = convertAssignerNameToId(assignersNames.split(', '), storedUsersMap); // Obtém IDs dos assinantes

                const existingTaskByProject = tasksByProjectMap.get(task.subject);

                if (existingTaskByProject) {
                    let changed = false; // Flag para indicar se houve alterações
                    let changeDetails = `**Projeto ${task.subject} atualizado:**`; // Detalhes das alterações realizadas

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
                    if (existingTaskByProject.assinantes !== assignersIds) {
                        const oldAssignerNames = convertAssignerIdsToNames(existingTaskByProject.assinantes.split(', '), storedUsersMap);
                        const newAssignerNames = convertAssignerIdsToNames(assignersIds.split(', '), storedUsersMap);

                        changeDetails += `\n  - Assinantes: de "${oldAssignerNames}" para "${newAssignerNames}"`;
                        existingTaskByProject.assinantes = assignersIds;
                        changed = true;
                    }

                    // Verifica e atualiza a descrição do projeto
                    if (existingTaskByProject.descricao !== fullDescription) {
                        const oldDescriptionWithoutUrls = removeUrls(existingTaskByProject.descricao);
                        changeDetails += `\n  - Descrição: de "${removeUrls(existingTaskByProject.descricao)}" para "${formattedDescription}"`;
                        existingTaskByProject.descricao = fullDescription;
                        changed = true;
                    }

                    // Adiciona a informação sobre a presença do modelo de negociação, se aplicável
                    changeDetails += `\n  - Modelo de Negociação Presente: ${negotiationModelPresent ? 'Sim' : 'Não'}`;

                    // Se houver alterações, atualiza o projeto no Parse
                    if (changed) {
                        const projectToUpdate = new Parse.Query(Parse.Object.extend('projeto'));
                        const projectObject = await projectToUpdate.get(existingTaskByProject.id);

                        projectObject.set('status', existingTaskByProject.status);
                        projectObject.set('sprint', existingTaskByProject.sprint);
                        projectObject.set('assinantes', assignersIds);
                        projectObject.set('descricao', existingTaskByProject.descricao);
                        tasksBatch.push(projectObject.save()); // Adiciona a promessa de salvamento ao array
                        changesLog.push(changeDetails); // Registra as alterações no log de mudanças
                    }
                } else {
                    // Se a tarefa relacionada ao projeto não existir, cria um novo no Parse
                    const TaskByProjectClass = Parse.Object.extend('projeto');
                    const newTaskByProject = new TaskByProjectClass();

                    newTaskByProject.set('titulo', task.subject);
                    newTaskByProject.set('status', statusMap[task.status]);
                    newTaskByProject.set('sprint', sprintName);
                    newTaskByProject.set('assinantes', assignersIds);
                    newTaskByProject.set('descricao', fullDescription); // Salva a descrição completa no banco de dados

                    tasksBatch.push(newTaskByProject.save()); // Adiciona a promessa de salvamento ao array

                    const newAssignerNames = convertAssignerIdsToNames(assignersIds.split(', '), storedUsersMap);
                    changesLog.push(`Novo projeto adicionado:\n **${task.subject}** \n  - Assinantes: ${newAssignerNames}\n  - Descrição: ${formattedDescription}\n  - Modelo de Negociação Presente: ${negotiationModelPresent ? 'Sim' : 'Não'}`); // Registra o novo projeto no log de mudanças
                }
            }));
        }));

        await Promise.all(tasksBatch); // Aguarda todas as promessas de salvamento serem resolvidas
    } catch (error) {
        console.log(logPath, `Erro ao obter tarefas por projeto: ${error.message}`); // Registra erros no log
        changesLog.push(`Erro ao obter tarefas por projeto: ${error.message}`); // Adiciona erro ao log de mudanças
    }

    // Exibe todas as mudanças registradas no log
    changesLog.forEach(change => console.log(logPath, change));

    return changesLog; // Retorna o log de mudanças
}

module.exports = { addOrUpdateTaskByProjectsToBack4App };
