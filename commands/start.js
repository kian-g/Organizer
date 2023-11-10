require('../customLogger');

// commands/start.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const AutoSaveSetting = require('../models/AutoSaveSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Reactivates an autosave setting with a given tag.')
        .addStringOption(option => option.setName('tag')
            .setDescription('The tag of the autosave setting to reactivate')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const tag = interaction.options.getString('tag');

        try {
            // Reactivate the autosave setting with the provided tag
            // Modify the query to match the tag within the tags array
            const result = await AutoSaveSetting.updateOne(
                {
                    userId: interaction.user.id,
                    guildId: interaction.guildId,
                    tags: tag // Searching within the array
                },
                { autoSaveActive: true }
            );

            let content = result.matchedCount === 0
                ? `No autosave setting found with tag "${tag}".`
                : `Autosave setting with tag "${tag}" reactivated.`;

            await interaction.editReply({ content });
        } catch (error) {
            console.error('Failed to start the autosave setting:', error);
            await interaction.editReply({ content: 'There was an error while processing your command.' });
        }
    },
};
