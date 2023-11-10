const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get the invite link to the support server.'),

    async execute(interaction) {
        const supportServerLink = require('../Config/config.json').supportServerLink; // The invite link to the support server

        try {
            // Reply with the support server link
            await interaction.reply({
                content: `Join our support server: ${supportServerLink}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Failed to provide support server link:', error);
            await interaction.reply({
                content: 'There was an error while processing your command.',
                ephemeral: true
            });
        }
    },
};
