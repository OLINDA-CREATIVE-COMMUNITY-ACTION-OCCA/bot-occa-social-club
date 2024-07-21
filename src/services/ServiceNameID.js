
// todo transformar essas duas funções em apenas uma que vai ter um compotamento diferente se tiver
// , dentro assigner

/**
 * Função para converter IDs de atribuidores em nomes de usuários
 * @param {*} assigners 
 * @param {*} storedUsersMap 
 * @returns o nome do usuário ou o ID se o nome não for encontrado
 */
function convertAssignerIdsToNames(assigners, storedUsersMap) {
    const assignerIds = typeof assigners === 'string' ? assigners.split(', ') : assigners;

    return assignerIds.map(id => {
        const user = storedUsersMap.get(id.toString());
        return user ? user.nome : `ID: ${id}`; 
    }).join(', ');
}

/**
 *  Função para obter os IDs dos atribuidores a partir dos nomes
 * @param {*} assignerNames 
 * @param {*} storedUsersMap 
 * @returns null se o nome do usuário não for encontrado nos usuários armazenados
 */
function convertAssignerNameToId(assignerNames, storedUsersMap) {
    const ids = assignerNames.map(name => {
        for (let [id, user] of storedUsersMap.entries()) {
            if (user.nome === name.trim()) {
                return id;
            }
        }
        return null;
    }).filter(id => id !== null).join(', ');

    return ids;
}

module.exports = { 
    convertAssignerIdsToNames,
    convertAssignerNameToId,
};
