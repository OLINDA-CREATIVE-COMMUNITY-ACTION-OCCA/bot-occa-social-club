const Parse = require('parse/node'); // Importa o SDK do Parse
const { Sequelize } = require('sequelize');
const { User } = require('../models/User');

/**
 * Atualiza o Back4App com as informações dos novos usuários de eva
 * @param user
 * @returns {Promise<null|string>}
 */
async function userExistsAndUpdate(user) {
    const existingUser = User.findOne({ where: { eva_id: user.id } })

    if (existingUser) { // Se o usuário já existir
        // Verifica se o nome atual é diferente do nome no banco de dados

        if (existingUser.eva_name !== user.full_name) {
            await existingUser.update({
                eva_name: user.full_name
            })
            await existingUser.save();
        }

        // if (existingUser.get('Nome') !== user.full_name) {
        //     // Atualiza o nome do usuário no banco de dados
        //     existingUser.set('Nome', user.full_name);
        //     await existingUser.save(); // Salva as alterações no banco de dados
        //     return `Usuário ${user.full_name} atualizado com sucesso.`; // Retorna mensagem de sucesso
        // }
        return null; // Retorna null se o nome já estiver correto
    } else { // Se o usuário não existir

        const newUser = await User.create({
            eva_name: user.name,
            eva_id: user.id
        })

        console.log(newUser.toJSON())
        // // Cria um novo objeto de usuário e define ID e nome
        // const newUser = new UserClass();
        // newUser.set('ID', user.id.toString());
        // newUser.set('Nome', user.full_name);
        // await newUser.save(); // Salva o novo usuário no banco de dados
        return `Usuário ${user.full_name} adicionado com sucesso.`; // Retorna mensagem de sucesso
    }
}

// Exporta a função userExistsAndUpdate para ser utilizada em outros módulos
module.exports = { userExistsAndUpdate };
