// commands/auto.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageAttachment } = require("discord.js")

const AutoSaveSetting = require('../models/AutoSaveSetting');
const UserSetting = require('../models/UserSetting');

async function handleAutoSave(message, setting, client) {
    if (setting.autoSaveActive && setting.targetUserId === message.author.id) {
        const autosaveChannel = client.channels.cache.get(setting.channelId);
        if (!autosaveChannel) {
            console.error(`Channel not found: ${setting.channelId}`);
            return;
        }

        // Retrieve the settings for the user who initiated the auto command
        const initiatorSettings = await UserSetting.findOne({ userId: setting.userId });
        const embedColor = initiatorSettings && initiatorSettings.embedColor ? initiatorSettings.embedColor : 'Green'; // Default to white if not set

        const embed = new EmbedBuilder()
            .setColor(embedColor) // Set the embed color based on the initiator's settings
            .setTimestamp(message.createdTimestamp)
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });

        // Set the description and image if available
        if (message.content) {
            embed.setDescription(message.content);
        }
        if (message.attachments.size > 0) {
            const imageAttachment = message.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
            if (imageAttachment) {
                embed.setImage(imageAttachment.url);
            }
        }

        await autosaveChannel.send({ embeds: [embed] });
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto')
        .setDescription('Automatically saves every message to a designated channel.')
        .addChannelOption(option => option.setName('channel')
            .setDescription('The channel to save messages to')
            .setRequired(true))
        .addUserOption(option => option.setName('user')
            .setDescription('The user whose messages to automatically save')
            .setRequired(false)),

    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('channel');
        let targetUser = interaction.options.getUser('user');

        // If no user is provided, default to the provided user ID
        if (!targetUser) {
            try {
                targetUser = await interaction.client.users.fetch('936929561302675456');
            } catch (error) {
                console.error('Error fetching the default user:', error);
                await interaction.reply({ content: 'Failed to set the default user for autosave.', ephemeral: true });
                return;
            }
        }

        // Save or update the autosave settings for this user and channel in the database
        const setting = await AutoSaveSetting.findOneAndUpdate(
            {
                userId: interaction.user.id,
                guildId: interaction.guildId // Adding guildId ensures uniqueness per guild
            },
            {
                channelId: targetChannel.id,
                autoSaveActive: true,
                targetUserId: targetUser ? targetUser.id : null
            },
            {
                new: true,
                upsert: true // This creates a new document if one doesn't exist
            }
        );

        const key = `${interaction.guildId}-${setting.targetUserId}`;
        interaction.client.autoSaveSettings.set(key, setting);


        await interaction.reply({ content: `Autosave is now active for ${targetUser.username} in ${targetChannel.name}.`, ephemeral: true });
    },
    handleAutoSave,
};
