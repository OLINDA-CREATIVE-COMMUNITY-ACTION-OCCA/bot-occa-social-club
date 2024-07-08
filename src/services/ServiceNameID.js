
// todo transformar essas duas funções em apenas uma que vai ter um compotamento diferente se tiver
// , dentro assigner
/**
 * Função para converter IDs de atribuidores em nomes de usuários
 * @param {*} assignerIds 
 * @param {*} storedUsers 
 * @returns o nome do usuário ou o ID se o nome não for encontrado
 */
function convertAssignerIdsToNames(assignerIds, storedUsers) {
    return assignerIds.split(', ').map(id => {
        const user = storedUsers.find(user => user.id.toString() === id.toString());
        return user ? user.nome : `ID: ${id}`; 
    }).join(', '); // Junta os nomes separados por ', '
}

/**
 * Função para obter os nomes dos atribuidores a partir dos IDs
 * @param {*} assignerIds 
 * @param {*} storedUsers 
 * @returns o nome do usuário ou o ID se o nome não for encontrado Junta os nomes separados por ', '
 */
function getAssignerNames(assignerIds, storedUsers) {
    return assignerIds.map(id => {
        const user = storedUsers.find(user => user.id.toString() === id.toString());
        return user ? user.nome : `ID: ${id}`; 
    }).join(', ');
}

/**
 *  Função para obter os IDs dos atribuidores a partir dos nomes
 * 
 * @param {*} assignerNames 
 * @param {*} storedUsers 
 * @returns null se o nome do usuário não for encontrado nos usuários armazenados
 */
function convertAssignerNameToId(assignerNames, storedUsers) {
    const ids = assignerNames.map(name => {
        const user = storedUsers.find(user => user.nome === name.trim());
        if (user) {
            return user.id;
        } else {
            return null; 
        }
    }).filter(id => id !== null).join(', '); // Remove qualquer valor null e junta os IDs com ', '

    return ids;
}

module.exports = { 
    convertAssignerIdsToNames,
    getAssignerNames,
    convertAssignerNameToId,
};
