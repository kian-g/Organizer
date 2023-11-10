require('../CustomFeatures/customLogger');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AutoSaveSetting = require('../models/AutoSaveSetting');

const messageMap = new Map();

async function handleAutoSave(message, client) {
    if (!message.content && message.attachments.size === 0) return;

    const settings = await AutoSaveSetting.find({
        guildId: message.guildId,
        targetUserId: message.author.id,
        autoSaveActive: true
    });

    for (const setting of settings) {
        const autosaveChannel = client.channels.cache.get(setting.channelId);
        if (!autosaveChannel) {
            console.error(`Channel not found: ${setting.channelId}`);
            continue;
        }

        const embed = new EmbedBuilder()
            .setColor("Green")
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

        const sentMessage = await autosaveChannel.send({ embeds: [embed] });
        messageMap.set(message.id, sentMessage.id);

        setTimeout(() => {
            messageMap.delete(message.id);
        }, 85000); // Adjusted to the desired 45 seconds
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
            .setRequired(false))
        .addStringOption(option => option.setName('tag')
            .setDescription('A tag to label this autosave setting')
            .setRequired(false)),

    async execute(interaction) {
        const tag = interaction.options.getString('tag');
        const targetChannel = interaction.options.getChannel('channel');
        let targetUser = interaction.options.getUser('user');

        // Default user ID if no user is provided
        const defaultUserId = '936929561302675456';

        if (!targetUser) {
            try {
                targetUser = await interaction.client.users.fetch(defaultUserId);
            } catch (error) {
                console.error('Error fetching the default user:', error);
                // Make sure to only reply if the interaction hasn't been replied to or deferred
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: 'Failed to set the default user for autosave.', ephemeral: true });
                } else if (interaction.deferred) {
                    await interaction.editReply({ content: 'Failed to set the default user for autosave.' });
                }
                return;
            }
        }

        // First, deactivate any existing tags for the specific tracked user
        await AutoSaveSetting.updateMany(
            {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                targetUserId: targetUser.id
            },
            { autoSaveActive: false }
        );

        // Then, create or update the new tag for the tracked user
        const filter = {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            targetUserId: targetUser.id,
            tags: [tag]
        };

        const update = {
            channelId: targetChannel.id,
            autoSaveActive: true,
            tags: [tag]
        };

        const options = {
            new: true,
            upsert: true
        };

        try {
            const setting = await AutoSaveSetting.findOneAndUpdate(filter, update, options);
            const key = `${interaction.guildId}-${setting.targetUserId}`;
            interaction.client.autoSaveSettings.set(key, setting);

            // Reply with the success message
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({ content: `Autosave is now active for ${targetUser.username} in <#${targetChannel.id}>.`, ephemeral: true });
            } else if (interaction.deferred) {
                await interaction.editReply({ content: `Autosave is now active for ${targetUser.username} in <#${targetChannel.id}>.` });
            }
        } catch (error) {
            console.error('Failed to save the autosave setting:', error);
            // Follow up with the error message if the interaction has already been replied to or deferred
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({ content: 'There was an error while setting up autosave.', ephemeral: true }).catch(console.error);
            } else if (interaction.deferred) {
                await interaction.editReply({ content: 'There was an error while setting up autosave.' }).catch(console.error);
            } else {
                await interaction.followUp({ content: 'There was an error while setting up autosave.', ephemeral: true }).catch(console.error);
            }
        }
    },

    handleAutoSave,
    messageMap,
};
