const { SlashCommandBuilder } = require('@discordjs/builders');
const AutoSaveSetting = require('../models/AutoSaveSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a specific autosave setting with a given tag.')
        .addStringOption(option => option.setName('tag')
            .setDescription('The tag of the autosave setting to delete')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const tag = interaction.options.getString('tag');

        try {
            // Attempt to delete the autosave setting with the provided tag
            const result = await AutoSaveSetting.deleteOne({
                userId: interaction.user.id,
                guildId: interaction.guildId,
                tags: tag
            });

            let content = result.deletedCount === 0
                ? `No autosave setting found with tag "${tag}", or it's already deleted.`
                : `Autosave setting with tag "${tag}" has been deleted.`;

            await interaction.editReply({ content });
        } catch (error) {
            console.error('Failed to delete the autosave setting:', error);
            await interaction.editReply({ content: 'There was an error while processing your command.' });
        }
    },
};
