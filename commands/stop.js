// commands/stop.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const AutoSaveSetting = require('../models/AutoSaveSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the automatic saving of messages.')
        .addUserOption(option => option.setName('user')
            .setDescription('The user whose messages to stop autosaving')
            .setRequired(false))
        .addStringOption(option => option.setName('all')
            .setDescription('Stops tracking all messages if set to "all"')
            .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const all = interaction.options.getString('all');

        if (user) {
            // Stop tracking messages from a specific user
            const result = await AutoSaveSetting.updateOne(
                { userId: interaction.user.id, guildId: interaction.guildId, targetUserId: user.id },
                { autoSaveActive: false }
            );

            if (result.matchedCount === 0) {
                await interaction.reply({ content: `No active autosave found for user <@${user.id}>.`, ephemeral: true });
            } else {
                await interaction.reply({ content: `Autosave stopped for user <@${user.id}>.`, ephemeral: true });
            }
        } else if (all === 'all') {
            // Stop tracking messages from all users
            await AutoSaveSetting.updateMany(
                { userId: interaction.user.id, guildId: interaction.guildId },
                { autoSaveActive: false }
            );
            await interaction.reply({ content: 'Autosave stopped for all users.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Please specify a user or "all" to stop autosaving.', ephemeral: true });
        }

        // Update the in-memory settings
        if (user || all === 'all') {
            interaction.client.autoSaveSettings.forEach((value, key) => {
                if (key.startsWith(interaction.guildId)) {
                    if (all === 'all' || value.targetUserId === user.id) {
                        interaction.client.autoSaveSettings.delete(key);
                    }
                }
            });
        }
    },
};
