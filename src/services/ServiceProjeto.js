// projectService.js

// Importações de módulos e configuração inicial
const axios = require('axios'); // Para requisições HTTP
const Parse = require('parse/node'); // Para interação com o Parse Server
const { getStoredTasksByProjects, getStoredSprints, fetchStoredUsers } = require('../repository/projetotRepository'); // Funções de acesso aos dados armazenados
const { convertAssignerIdsToNames, getAssignerNames, getAssignerIds } = require('../services/ServiceNameID'); // Funções de conversão de IDs para nomes e vice-versa
const { sprintNameMap, statusMap } = require('../services/ServiceSprint'); // Mapeamentos de nomes de sprint e status
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Função assíncrona para adicionar ou atualizar projetos no Back4App
async function addOrUpdateProjectsToBack4App() {
    let changesLog = []; // Array para registrar alterações realizadas

    try {
        // Obtenção de sprints e projetos armazenados e usuários do Parse
        const storedSprints = await getStoredSprints();
        const storedProjects = await getStoredTasksByProjects();
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

            const projects = tasksResponse.data; // Array de projetos recebidos da API

            if (!Array.isArray(projects)) {
                throw new Error('A resposta da API não é um array'); // Lança um erro se a resposta não for um array
            }

            // Iteração sobre cada projeto recebido da API
            for (const project of projects) {
                if (project.subject === 'teste') {
                    console.log(`Projeto ${project.subject} ignorado.`); // Ignora projetos de teste com o assunto 'teste'
                    continue;
                }

                // Obtém nomes dos assinantes e IDs dos assinantes
                const assignersNames = getAssignerNames(project.assigners, storedUsers);
                const assignersIds = getAssignerIds(assignersNames.split(', '), storedUsers);
                const existingProject = storedProjects.find(p => p.titulo === project.subject); // Busca por projeto existente pelo título

                // Verifica se o projeto já existe no armazenamento
                if (existingProject) {
                    let changed = false; // Flag para indicar se houve alterações
                    let changeDetails = `Projeto ${project.subject} atualizado:`; // Detalhes das alterações realizadas

                    const existingAssignerIds = existingProject.assinantes; // IDs de assinantes existentes no projeto

                    // Verifica e atualiza o status do projeto se necessário
                    if (existingProject.status !== statusMap[project.status]) {
                        changeDetails += `\n  - Status: de "${existingProject.status}" para "${statusMap[project.status]}"`;
                        existingProject.status = statusMap[project.status];
                        changed = true;
                    }

                    // Verifica e atualiza a sprint do projeto se necessário
                    if (existingProject.sprint !== sprintName) {
                        changeDetails += `\n  - Sprint: de "${existingProject.sprint}" para "${sprintName}"`;
                        existingProject.sprint = sprintName;
                        changed = true;
                    }

                    // Verifica e atualiza os assinantes do projeto se necessário
                    if (existingAssignerIds !== assignersIds) {
                        const oldAssignerNames = convertAssignerIdsToNames(existingAssignerIds, storedUsers);
                        const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);

                        changeDetails += `\n  - Assinantes: de "${oldAssignerNames}" para "${newAssignerNames}"`;
                        existingProject.assinantes = assignersIds;
                        changed = true;
                    }

                    // Se houver alterações, atualiza o projeto no Parse
                    if (changed) {
                        const projectToUpdate = new Parse.Query(Parse.Object.extend('projeto'));
                        const projectObject = await projectToUpdate.get(existingProject.id);

                        projectObject.set('status', existingProject.status);
                        projectObject.set('sprint', existingProject.sprint);
                        projectObject.set('assinantes', assignersIds);
                        await projectObject.save(); // Salva as alterações no projeto
                        changesLog.push(changeDetails); // Registra as alterações no log de mudanças
                    }
                } else {
                    // Se o projeto não existir, cria um novo no Parse
                    const ProjectClass = Parse.Object.extend('projeto');
                    const newProject = new ProjectClass();

                    newProject.set('titulo', project.subject);
                    newProject.set('status', statusMap[project.status]);
                    newProject.set('sprint', sprintName);
                    newProject.set('assinantes', assignersIds);
                    await newProject.save(); // Salva o novo projeto no Parse

                    const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);
                    changesLog.push(`Novo projeto adicionado: ${project.subject}\n  - Assinantes: ${newAssignerNames}`); // Registra o novo projeto no log de mudanças
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

module.exports = { addOrUpdateProjectsToBack4App }; // Exporta a função para utilização externa
