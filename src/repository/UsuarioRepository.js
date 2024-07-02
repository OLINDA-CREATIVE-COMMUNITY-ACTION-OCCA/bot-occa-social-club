const Parse = require('parse/node'); // Importa o SDK do Parse

async function userExistsAndUpdate(user) {
    // Define a classe 'usuario' no Parse
    const UserClass = Parse.Object.extend('usuario');
    // Cria uma consulta para verificar se o usuário já existe pelo ID
    const query = new Parse.Query(UserClass);
    query.equalTo('ID', user.id.toString());
    // Executa a consulta para obter o primeiro usuário correspondente
    const existingUser = await query.first();

    if (existingUser) { // Se o usuário já existir
        // Verifica se o nome atual é diferente do nome no banco de dados
        if (existingUser.get('Nome') !== user.full_name) {
            // Atualiza o nome do usuário no banco de dados
            existingUser.set('Nome', user.full_name);
            await existingUser.save(); // Salva as alterações no banco de dados
            return `Usuário ${user.full_name} atualizado com sucesso.`; // Retorna mensagem de sucesso
        }
        return null; // Retorna null se o nome já estiver correto
    } else { // Se o usuário não existir
        // Cria um novo objeto de usuário e define ID e nome
        const newUser = new UserClass();
        newUser.set('ID', user.id.toString());
        newUser.set('Nome', user.full_name);
        await newUser.save(); // Salva o novo usuário no banco de dados
        return `Usuário ${user.full_name} adicionado com sucesso.`; // Retorna mensagem de sucesso
    }
}

// Exporta a função userExistsAndUpdate para ser utilizada em outros módulos
module.exports = { userExistsAndUpdate };
