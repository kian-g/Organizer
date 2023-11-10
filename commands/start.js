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
            // Find the currently active tag(s) to inform the user about deactivation
            const activeSettings = await AutoSaveSetting.find({
                userId: interaction.user.id,
                guildId: interaction.guildId,
                autoSaveActive: true
            });

            // Deactivate any existing active tracking for the user
            await AutoSaveSetting.updateMany(
                {
                    userId: interaction.user.id,
                    guildId: interaction.guildId,
                    autoSaveActive: true
                },
                { autoSaveActive: false }
            );

            // Activate the autosave setting with the provided tag
            const activationResult = await AutoSaveSetting.updateOne(
                {
                    userId: interaction.user.id,
                    guildId: interaction.guildId,
                    tags: tag
                },
                { autoSaveActive: true }
            );

            let content = '';
            if (activationResult.matchedCount === 0) {
                content = `No autosave setting found with tag "${tag}".`;
            } else {
                content = `Autosave setting with tag "${tag}" reactivated.`;
                // Inform the user about the deactivation of other tags
                const deactivatedTags = activeSettings.filter(setting => !setting.tags.includes(tag))
                    .map(setting => setting.tags.join(', ')).join(', ');
                if (deactivatedTags) {
                    content += ` The following tag(s) were deactivated: "${deactivatedTags}."`;
                }
            }

            await interaction.editReply({ content });
        } catch (error) {
            console.error('Failed to start the autosave setting:', error);
            await interaction.editReply({ content: 'There was an error while processing your command.' });
        }
    },
};
