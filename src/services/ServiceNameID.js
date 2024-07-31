import User from "../models/User.js";
import {Where} from "sequelize/lib/utils";
import {where} from "sequelize";

/**
 * Função para converter IDs de atribuidores em nomes de usuários
 * @param {*} assigners
 * @param {*} storedUsers
 * @returns o nome do usuário ou o ID se o nome não for encontrado
 */
export async function convertAssignerIdsToNames(assigners, storedUsers) {
    const assignersNames = []
    if(assigners) {
        for (const assignerId of assigners) {
            // isso é muito custoso em questão de tempo e precisa ser removido
            const user = storedUsers.find(user => user.eva_id == assignerId);
            assignersNames.push(user ? user.eva_name : `ID: ${assignerId}`);
        }
    }
    return assignersNames.join(', ');
}

/**
 *  Função para obter os IDs dos atribuidores a partir dos nomes
 * @param {*} assignerNames
 * @param {*} storedUsersMap
 * @returns null se o nome do usuário não for encontrado nos usuários armazenados
 */
export function convertAssignerNameToId(assignerNames, storedUsersMap) {
    return assignerNames.map(name => {
        for (let [id, user] of storedUsersMap.entries()) {
            if (user.eva_name === name.trim()) {
                return id;
            }
        }
        return null;
    }).filter(id => id !== null).join(', ');
}