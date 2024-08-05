import { Sequelize } from "sequelize";
import consoleOccinho from "./ConsoleOccinho.js";
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: 'localhost',
        dialect: 'sqlite',
        storage: '../database.sqlite',
    }
);
/**
 * Inicia a conexão com o banco de dados e cria os models se não existem ainda
 */
export async function startDatabase() {
    try {
        await sequelize.sync();
        await sequelize.authenticate();
        console.log("A conexão com o banco de dados foi estabelecida com sucesso!")
    } catch (error) {
        console.error('Não foi possível se conectar com o banco de dados', error)
    }
}
