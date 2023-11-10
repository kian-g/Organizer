require('../CustomFeatures/customLogger');

const { SlashCommandBuilder } = require('@discordjs/builders');
const AutoSaveSetting = require('../models/AutoSaveSetting');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tracking')
        .setDescription('Lists all users that you are currently tracking.'),

    // In your 'tracking' command execute function
    async execute(interaction) {
        // Fetch all autosave settings for this user in the current guild, regardless of active status.
        const settings = await AutoSaveSetting.find({
            userId: interaction.user.id,
            guildId: interaction.guildId,
        });

        if (settings.length === 0) {
            await interaction.reply({ content: 'You are not currently tracking any users.', ephemeral: true });
            return;
        }

        // Construct a list of users being tracked, their associated tags, and status (ENABLED/DISABLED)
        let replyText = 'You are currently tracking messages from the following users:\n';
        settings.forEach(setting => {
            const userDescription = setting.targetUserId ? `<@${setting.targetUserId}>` : 'All Users';
            const tagDescription = setting.tags.length > 0 ? `(Tag: ${setting.tags[0]})` : '(No tag specified)';
            const status = setting.autoSaveActive ? 'ENABLED' : 'DISABLED';
            replyText += `${userDescription} in <#${setting.channelId}> ${tagDescription} - ${status}\n`;
        });

        await interaction.reply({ content: replyText, ephemeral: true });
    }

};
