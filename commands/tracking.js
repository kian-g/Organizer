require('../customLogger');

const { SlashCommandBuilder } = require('@discordjs/builders');
const AutoSaveSetting = require('../models/AutoSaveSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tracking')
        .setDescription('Lists all users that you are currently tracking.'),

    async execute(interaction) {
        // Fetch all autosave settings for this user in the current guild that are active.
        const settings = await AutoSaveSetting.find({
            userId: interaction.user.id,
            guildId: interaction.guildId,
            autoSaveActive: true
        });

        if (settings.length === 0) {
            await interaction.reply({ content: 'You are not currently tracking any users.', ephemeral: true });
            return;
        }

        // Construct a list of users being tracked and their associated tags
        let replyText = 'You are currently tracking messages from the following users:\n';
        settings.forEach(setting => {
            // If targetUserId is null or undefined, it means all users are being tracked.
            const userDescription = setting.targetUserId ? `<@${setting.targetUserId}>` : 'All Users';
            const tagDescription = setting.tag ? `(Tag: ${setting.tag})` : '(No tag specified)';
            replyText += `${userDescription} in <#${setting.channelId}> ${tagDescription}\n`;
        });

        await interaction.reply({ content: replyText, ephemeral: true });
    },
};
