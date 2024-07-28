import axios from 'axios'

/**
 * Essa função pega o token de autoriazação do eva e precisa ser chamada logo no inicio do index.js
 * @param {string} user nome de usuário do EVA
 * @param {string} password senha do EVA
 */
export async function getAuthToken(user, password) {
    try {
        const response = await axios.post(process.env.URL_EVA + 'auth', {
            "password": `${password}`,
            "type": "normal",
            "username": `${user}`
        });
        return response.data.auth_token
    } catch (error) {
        console.error('Erro ao tentar pegar o Token:', error)
        throw error;
    }
}
