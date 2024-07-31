import User  from '../models/User.js'
import consoleOccinho from "../util/ConsoleOccinho.js";

/**
 * Atualiza no banco de dados do bot as informações dos novos usuários de eva
 * @param user
 * @param storedUsers
 * @returns {Promise<null|string>}
 */
export async function userExistsAndUpdate(user, storedUsers) {
    const existingUser = storedUsers.find(storedUsers => storedUsers.eva_id == user.id);

    if (existingUser) { // Se o usuário já existir
        // Verifica se o nome atual é diferente do nome no banco de dados
        if (existingUser.eva_name !== user.full_name && user.full_name != null) {
            existingUser.eva_name = user.full_name;
            await existingUser.save();
        }
        return `Nome do novo usuário ${existingUser.eva_name} atualizado`; // Retorna null se o nome já estiver correto
    } else { // Se o usuário não existir

        const newUser = await User.create({
            eva_name: user.full_name,
            eva_id: user.id
        })
        return `Usuário ${newUser.eva_name} adicionado com sucesso.`; // Retorna mensagem de sucesso
    }
}