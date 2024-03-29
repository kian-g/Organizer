const { SlashCommandBuilder } = require('@discordjs/builders');
const AutoSaveSetting = require('../models/AutoSaveSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the automatic saving of messages.')
        .addUserOption(option => option.setName('user')
            .setDescription('The user whose messages to stop autosaving')
            .setRequired(false))
        .addStringOption(option => option.setName('tag')
            .setDescription('The tag of the autosave setting to stop')
            .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const tag = interaction.options.getString('tag');
        const user = interaction.options.getUser('user');

        // Automatically consider "all" if neither tag nor user is provided
        const all = tag || user ? false : 'all';

        let content = '';

        if (tag) {
            // Stop the autosave setting with the provided tag
            const result = await AutoSaveSetting.updateMany(
                {
                    userId: interaction.user.id,
                    guildId: interaction.guildId,
                    tags: tag // Searching within the array
                },
                { autoSaveActive: false }
            );
            content = result.modifiedCount === 0
                ? `No autosave setting found with tag "${tag}".`
                : `Autosave setting with tag "${tag}" stopped.`;
        } else if (user) {
            // Stop tracking messages from a specific user
            const result = await AutoSaveSetting.updateMany(
                {
                    userId: interaction.user.id,
                    guildId: interaction.guildId,
                    targetUserId: user.id
                },
                { autoSaveActive: false }
            );
            content = result.modifiedCount === 0
                ? `No active autosave found for user <@${user.id}>.`
                : `Autosave stopped for user <@${user.id}>.`;
        } else if (all === 'all') {
            // Stop tracking messages from all users
            await AutoSaveSetting.updateMany(
                { userId: interaction.user.id, guildId: interaction.guildId },
                { autoSaveActive: false }
            );
            content = 'Autosave stopped for all users.';
        } else {
            content = 'Please provide a user or a tag to stop autosaving, or use the command without options to stop all.';
        }

        await interaction.editReply({ content });
    },
};
