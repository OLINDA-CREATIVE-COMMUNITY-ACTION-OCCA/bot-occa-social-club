import Task from '../models/Task.js';
import axios from 'axios';
import {kanbanStatusMap} from "../repository/SprintRepository.js";
import {convertAssignerIdsToNames, convertAssignerNameToId} from "./ServiceNameID.js";
import consoleOccinho from "../util/ConsoleOccinho.js";
import {removeUrls} from "./ServiceDescription.js";


/**
 *
 * @param tasksFromEVA
 * @param tasksFromDatabase
 * @param sprintName
 * @param storedUsers
 * @param authTokenEva
 * @returns {Promise<void>}
 */
export async function updateOrCreateTasks(tasksFromEVA,
                                          tasksFromDatabase,
                                          sprintName,
                                          storedUsers,
                                          authTokenEva) {
    const tasksBatch = [];
    const regexDescriptionModel = /\[N\s*=\s*\d+\s*:\s*[^,\]]+(?:,\s*N\s*=\s*\d+\s*:\s*[^,\]]+)*]/;
    const regexNPrefix = /^\[\s*N\s*:\s*\d+\s*[Xx]\s*\d+\s*]\s?.*$/;

    /**
     * Array que registra atualizações de nome dos usuários, dos status de uma tarefa ou dos assinantes da tarefa
     * @type {*[string]}
     */
    let changesLog = [];
    const logPath = "updateOrCreateTask ";
    try {
        for (const taskFromEVA of tasksFromEVA) {
            if (taskFromEVA.subject === 'teste' || taskFromEVA.subject === 'Estudar o codigo (front end) - NOME MEMBRO [8x1][Individual]') {
                console.log(`Projeto ${taskFromEVA.subject} ignorado.`); // Ignora projetos de teste com o assunto 'teste'
                continue;
            }

            // Requisição adicional para obter a descrição da tarefa
            const taskDetailResponse = await axios.get(`https://apiproduction.evastrategy.com/api/v1/tasks/${taskFromEVA.id}`, {
                headers: {'Authorization': `Bearer ${authTokenEva}`} // Token de autorização da API
            });

            const taskDetail = taskDetailResponse.data; // Detalhes da tarefa, incluindo a descrição
            // remove a url da tarefa que veio do eva antes de 
            const fullDescription = removeUrls(taskDetail.description);


            // Extrair a parte relevante da descrição
            const descriptionMatch = fullDescription ? fullDescription.match(regexDescriptionModel) : null
            const description = descriptionMatch ? descriptionMatch[0] : 'essa tarefa não tem modelo de negociação'; // Se não houver correspondência, define mensagem padrão
            const storedUsersMap = new Map(storedUsers.map(user => [user.id.toString(), user]));

            // Obtém nomes dos assinantes e IDs dos assinantes
            const assignersIds = taskFromEVA.assigners

            const existingTask = tasksFromDatabase.find(taskFromDatabae => taskFromDatabae.eva_id == taskFromEVA.id)

            if (existingTask) {
                let changed = false; // Flag para indicar se houve alterações
                let changeDetails = `Projeto ${taskFromEVA.subject} atualizado:`; // Detalhes das alterações realizadas

                // Verifica e atualiza o status do projeto se necessário
                if (existingTask.eva_status_number != taskFromEVA.status) {
                    changeDetails += `\n  - Status: de "${existingTask.eva_status_number}" para "${kanbanStatusMap[taskFromEVA.status]}"`;
                    existingTask.eva_status_number = taskFromEVA.status;
                    existingTask.eva_status_name = kanbanStatusMap[taskFromEVA.status];
                    changed = true;
                }

                // Verifica e atualiza a sprint do projeto se necessário
                if (existingTask.eva_sprint_name != sprintName) {
                    changeDetails += `\n  - Sprint: de "${existingTask.eva_sprint_name}" para "${sprintName}"`;
                    existingTask.eva_sprint_name = sprintName;
                    changed = true;
                }

                // Verifica e atualiza os assinantes do projeto se necessário
                if (existingTask.eva_assigners_id != null &&
                    (existingTask.eva_assigners_id.length != assignersIds.length ||
                    !existingTask.eva_assigners_id.every((value, index) => value == assignersIds[index]))
                ) {
                    const oldAssignerNames = convertAssignerIdsToNames(existingTask.eva_assigners_id, storedUsers);
                    const newAssignerNames = convertAssignerIdsToNames(assignersIds, storedUsers);

                    changeDetails += `\n  - Assinantes: de "${oldAssignerNames}" para "${newAssignerNames}"`;
                    existingTask.eva_assigners_id = assignersIds;
                    changed = true;
                }

                if (regexNPrefix.test(taskFromEVA.subject)) {
                    // Se o modelo de negociação estiver presente
                    if (existingTask.eva_description != fullDescription) {
                        // Atualiza a descrição completa e mostra apenas o modelo de negociação no log
                        changeDetails += `\n  - Descrição: de "${existingTask.eva_description}" para "${description}"`;
                        existingTask.eva_description = removeUrls(fullDescription)
                        changed = true;
                    }
                } else {
                    // Se o modelo de negociação não estiver presente
                    if (existingTask.eva_description != fullDescription) {
                        // Atualiza a descrição completa e mostra a mensagem padrão no log
                        changeDetails += `\n  - Descrição: de "${existingTask.eva_title}" para "essa tarefa não tem modelo de negociação"`;
                        existingTask.eva_description = removeUrls(fullDescription);
                        changed = true;
                    }
                }

                // Se houver alterações, atualiza as informações no banco de dados
                if (changed) {
                    tasksBatch.push(existingTask.save()); // Adiciona a promessa de salvamento ao array
                    changesLog.push(changeDetails); // Registra as alterações no log de mudanças
                }
            } else {
                const newTask = Task.create({
                    eva_id: taskFromEVA.id,
                    eva_title: taskFromEVA.subject,
                    eva_assigners_id: assignersIds,
                    eva_status_number: taskFromEVA.status,
                    eva_status_name: kanbanStatusMap[taskFromEVA.status],
                    eva_sprint_name: sprintName,
                    eva_description: removeUrls(taskFromEVA.description)
                })
                tasksBatch.push(newTask); // Adiciona a promessa de salvamento ao array
                const newAssignerNames =  convertAssignerIdsToNames(assignersIds, storedUsers);
                changesLog.push(`Nova tarefa adicionada: ${taskFromEVA.subject}\n  - Assinantes: ${newAssignerNames}\n  - Descrição: ${description}`); // Registra o novo projeto no log de mudanças
            }
        }

        changesLog.forEach(change => consoleOccinho?.log(logPath, change));
        await Promise.all(tasksBatch);
    } catch (error) {
        console.error("Ocorreu um erro na atualização das tarefas", error)
    }
}
