function convertAssignerIdsToNames(assignerIds, storedUsers) {
    // Função para converter IDs de atribuidores em nomes de usuários
    return assignerIds.split(', ').map(id => {
        const user = storedUsers.find(user => user.id.toString() === id.toString());
        return user ? user.nome : `ID: ${id}`; // Retorna o nome do usuário ou o ID se o nome não for encontrado
    }).join(', '); // Junta os nomes separados por ', '
}

function getAssignerNames(assignerIds, storedUsers) {
    // Função para obter os nomes dos atribuidores a partir dos IDs
    return assignerIds.map(id => {
        const user = storedUsers.find(user => user.id.toString() === id.toString());
        return user ? user.nome : `ID: ${id}`; // Retorna o nome do usuário ou o ID se o nome não for encontrado
    }).join(', '); // Junta os nomes separados por ', '
}

function getAssignerIds(assignerNames, storedUsers) {
    // Função para obter os IDs dos atribuidores a partir dos nomes
    const ids = assignerNames.map(name => {
        const user = storedUsers.find(user => user.nome === name.trim());
        if (user) {
            return user.id;
        } else {
            return null; // Retorna null se o nome do usuário não for encontrado nos usuários armazenados
        }
    }).filter(id => id !== null).join(', '); // Remove qualquer valor null e junta os IDs com ', '

    return ids;
}

module.exports = { 
    convertAssignerIdsToNames,
    getAssignerNames,
    getAssignerIds,
};
