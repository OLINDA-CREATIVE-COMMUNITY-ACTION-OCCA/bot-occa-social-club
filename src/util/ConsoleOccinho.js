require('dotenv').config();

/**
 * uma forma de esconder os logs da aplicação no ambiente de production e mostrar ela no ambiente de development
 * lembre sempre de usar o safe call ?.
 * @type {null|Console|console}
 */
let consoleOccinho = (process.env.NODE_ENV === "production") ? null : console

module.exports = { consoleOccinho };