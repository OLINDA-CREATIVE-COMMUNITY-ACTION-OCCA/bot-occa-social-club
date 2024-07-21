const { where } = require('sequelize');
const { Task } = require('../models/Task')

async function updateOrCreateTasks(tasksInEva, tasksInDatabase, sprintName) {
    const tasksBatch = [];
    /**
    * Array que registra atualizações de nome dos usuários, dos status de uma tarefa ou dos assinantes da tarefa
 * @type {*[string]}
 */
    let changesLog = [];

    // Iteração sobre cada projeto recebido da API
    for (const taskEva of tasksInEva) {
        if (taskEva.subject === 'teste' || taskEva.subject === 'Estudar o codigo (front end) - NOME MEMBRO [8x1][Individual]') {
            console.log(`Projeto ${taskEva.subject} ignorado.`); // Ignora projetos de teste com o assunto 'teste'
            continue;
        }

        // Requisição adicional para obter a descrição da tarefa
        const taskDetailResponse = await axios.get(`https://apiproduction.evastrategy.com/api/v1/tasks/${taskEva.id}`, {
            headers: { 'Authorization': `Bearer ${authTokenEva}` } // Token de autorização da API
        });

        const taskDetail = taskDetailResponse.data; // Detalhes da tarefa, incluindo a descrição
        const fullDescription = taskDetail.description; // Obtém a descrição completa da tarefa

        // Extrair a parte relevante da descrição
        const descriptionMatch = fullDescription.match(regexDescriptionModel);
        const description = descriptionMatch ? descriptionMatch[0] : 'essa tarefa não tem modelo de negociação'; // Se não houver correspondência, define mensagem padrão

        // Obtém nomes dos assinantes e IDs dos assinantes
        const assignersNames = getAssignerNames(taskEva.assigners, storedUsers);
        const assignersIds = convertAssignerNameToId(assignersNames.split(', '), storedUsers);

        const existingTask = await tasksInDatabase.findOne({ where: { eva_title: taskEva.subject } });

        if (existingTask) {
            let changed = false; // Flag para indicar se houve alterações
            let changeDetails = `Projeto ${taskEva.subject} atualizado:`; // Detalhes das alterações realizadas

            // Verifica e atualiza o status do projeto se necessário
            if (existingTask.eva_status_number !== statusMap[taskEva.status]) {
                changeDetails += `\n  - Status: de "${existingTask.eva_status_number}" para "${statusMap[taskEva.status]}"`;
                existingTask.eva_status_number = statusMap[taskEva.status];
                changed = true;
            }

            // Verifica e atualiza a sprint do projeto se necessário
            if (existingTask.eva_sprint_name !== sprintName) {
                changeDetails += `\n  - Sprint: de "${existingTask.eva_sprint_name}" para "${sprintName}"`;
                existingTask.eva_sprint_name = sprintName;
                changed = true;
            }

            // Verifica e atualiza os assinantes do projeto se necessário
            if (existingTask.eva_assigners_id !== assignersIds) {
                const oldAssignerNames = convertAssignerIdsToNames(existingTask.eva_assigners_id, storedUsers);
                const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);

                changeDetails += `\n  - Assinantes: de "${oldAssignerNames}" para "${newAssignerNames}"`;
                existingTask.eva_assigners_id = assignersIds;
                changed = true;
            }

            // Verifica e atualiza a descrição do projeto
            if (regexNPrefix.test(taskEva.subject)) {
                // Se o modelo de negociação estiver presente
                if (existingTask.eva_description !== fullDescription) {
                    // Atualiza a descrição completa e mostra apenas o modelo de negociação no log
                    changeDetails += `\n  - Descrição: de "${existingTask.eva_description}" para "${description}"`;
                    existingTask.eva_description = fullDescription;
                    changed = true;
                }
            } else {
                // Se o modelo de negociação não estiver presente
                if (existingTask.eva_description !== fullDescription) {
                    // Atualiza a descrição completa e mostra a mensagem padrão no log
                    changeDetails += `\n  - Descrição: de "${existingTask.eva_description}" para "essa tarefa não tem modelo de negociação"`;
                    existingTask.eva_description = fullDescription;
                    changed = true;
                }
            }

            // Se houver alterações, atualiza o projeto no Parse
            if (changed) {
                existingTask.set({
                    eva_status_number: taskEva.status,
                    eva_sprint_name: taskEva.milestone_slug,
                    eva_assigners_id: taskEva.assigners,
                    eva_description: taskEva.description
                })
                tasksBatch.push(existingTask.save()); // Adiciona a promessa de salvamento ao array
                changesLog.push(changeDetails); // Registra as alterações no log de mudanças
            }
        } else {
            // Se a tarefa relacionada ao projeto não existir, cria um novo no Parse
            const TaskByProjectClass = Parse.Object.extend('projeto');
            const newTaskByProject = new TaskByProjectClass();

            newTaskByProject.set('titulo', taskEva.subject);
            newTaskByProject.set('status', statusMap[taskEva.status]);
            newTaskByProject.set('sprint', sprintName);
            newTaskByProject.set('assinantes', assignersIds);
            newTaskByProject.set('descricao', fullDescription); // Salva a descrição completa no banco de dados
            tasksBatch.push(newTaskByProject.save()); // Adiciona a promessa de salvamento ao array

            const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);
            changesLog.push(`Novo projeto adicionado: ${taskEva.subject}\n  - Assinantes: ${newAssignerNames}\n  - Descrição: ${description}`); // Registra o novo projeto no log de mudanças
        }
    }
}