/**
 * uma forma de esconder os logs da aplicação no ambiente de production e mostrar ela no ambiente de development
 * lembre sempre de usar o safe call ?.
 * Isso é para ser utilizado como log temporário e não de erros, serve para esconder os logs temporários de produção
 * @type {null|Console|console}
 */
let consoleOccinho = (process.env.NODE_ENV === "production") ? null : console
export default consoleOccinho