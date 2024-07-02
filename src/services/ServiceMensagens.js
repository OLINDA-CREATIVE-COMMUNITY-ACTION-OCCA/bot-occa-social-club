async function sendLongMessage(interaction, message) {
    const maxLength = 1900; // Comprimento máximo de caracteres por mensagem no Discord

    if (message.length <= maxLength) {
        // Se a mensagem original for menor ou igual ao comprimento máximo
        await interaction.followUp(message); // Envia a mensagem diretamente
    } else {
        // Se a mensagem excede o comprimento máximo, divide-a em partes menores
        let chunks = [];
        for (let i = 0; i < message.length; i += maxLength) {
            chunks.push(message.substring(i, i + maxLength)); // Divide a mensagem em chunks de até 1900 caracteres
        }

        // Envia cada chunk como uma mensagem separada
        for (const chunk of chunks) {
            await interaction.followUp(chunk); // Envia cada chunk como uma nova mensagem
        }
    }
}

module.exports = { sendLongMessage }; // Exporta a função sendLongMessage para ser utilizada em outros módulos
