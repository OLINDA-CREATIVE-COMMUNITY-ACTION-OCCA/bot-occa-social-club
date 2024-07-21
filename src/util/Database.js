const { Sequelize } = require("sequelize")
const {consoleOccinho} = require("./ConsoleOccinho.js");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

/**
 * Inicia a conexão com o banco de dados e cria os models se não existem ainda
 */
async function startDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("A conexão foi estabelecida com sucesso!")
    } catch (error) {
        console.error('Não foi possível se conectar com o banco de dados', error)
    }
}

module.exports = { sequelize, startDatabase };