// auto.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AutoSaveSetting = require('../models/AutoSaveSetting');
const UserSetting = require('../models/UserSetting');

const messageMap = new Map();

// Function to handle the creation and sending of the auto-save embed message
async function handleAutoSave(message, client) {
    if (message.author.bot || (!message.content && message.attachments.size === 0)) return;

    const settings = await AutoSaveSetting.find({
        guildId: message.guildId,
        targetUserId: message.author.id,
        autoSaveActive: true
    });

    for (const setting of settings) {  // Change forEach to a for...of loop
        const autosaveChannel = client.channels.cache.get(setting.channelId);
        if (!autosaveChannel) {
            console.error(`Channel not found: ${setting.channelId}`);
            continue;  // Use continue instead of return
        }

        const initiatorSettings = await UserSetting.findOne({ userId: setting.userId });
        const embedColor = initiatorSettings?.embedColor ?? 'Green';

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTimestamp(message.createdTimestamp)
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });

        if (message.content) {
            embed.setDescription(message.content);
        }

        if (message.attachments.size > 0) {
            const imageAttachment = message.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
            if (imageAttachment) {
                embed.setImage(imageAttachment.url);
            }
        }

        // The sentMessage is inside the loop, so its scope is correct here
        const sentMessage = await autosaveChannel.send({ embeds: [embed] });
        messageMap.set(message.id, sentMessage.id);

        setTimeout(() => {
            messageMap.delete(message.id);
        }, 60000);
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
        const filter = {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            targetUserId: targetUser.id // Use the targetUserId in the filter to allow overwriting
        };

        const update = {
            channelId: targetChannel.id,
            autoSaveActive: true
        };

        const options = {
            new: true,
            upsert: true
        };

        try {
            const setting = await AutoSaveSetting.findOneAndUpdate(filter, update, options);

            // Update the client's in-memory map
            const key = `${interaction.guildId}-${setting.targetUserId}`;
            interaction.client.autoSaveSettings.set(key, setting);

            await interaction.reply({ content: `Autosave is now active for ${targetUser.username} in ${targetChannel.name}.`, ephemeral: true });
        } catch (error) {
            console.error('Failed to save the autosave setting:', error);
            await interaction.reply({ content: 'There was an error while setting up autosave.', ephemeral: true });
        }
    },

    handleAutoSave,
    messageMap,
};
