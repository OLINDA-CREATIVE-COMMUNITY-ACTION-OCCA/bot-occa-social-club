const Parse = require('parse/node'); // Importa o SDK do Parse
const { User } = require('../models/User');
/**
 * Atualiza o Back4App com as informações dos novos usuários de eva
 * @param user
 * @returns {Promise<null|string>}
 */
async function userExistsAndUpdate(user) {
    const existingUser = await User.findOne({ where: { eva_id: user.id } })

    if (existingUser) { // Se o usuário já existir
        // Verifica se o nome atual é diferente do nome no banco de dados

        if (existingUser.eva_name !== user.full_name && user.full_name != null) {
            await existingUser.update({
                eva_name: "otoniel"
            })
            await existingUser.save();
        }
        return null; // Retorna null se o nome já estiver correto
    } else { // Se o usuário não existir

        const newUser = await User.create({
            eva_name: user.full_name,
            eva_id: user.id
        })

        return `Usuário ${user.full_name} adicionado com sucesso.`; // Retorna mensagem de sucesso
    }
}

// Exporta a função userExistsAndUpdate para ser utilizada em outros módulos
module.exports = { userExistsAndUpdate };
