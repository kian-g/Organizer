require('../CustomFeatures/customLogger');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('save')
        .setDescription('Manually saves a message to a designated channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to save the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('The ID or link of the message to save')
                .setRequired(true)),

    async execute(interaction) {
        // Corrected option names to match those defined in the SlashCommandBuilder
        const targetChannel = interaction.options.getChannel('channel'); // Corrected from 'channel_to_save_to'
        const messageIdentifier = interaction.options.getString('identifier'); // Corrected from 'message_identifier'

        try {
            let messageToSave;
            // Check if messageIdentifier is a message link
            const messageLinkPattern = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
            const linkMatch = messageLinkPattern.exec(messageIdentifier);
            if (linkMatch) {
                // If it's a link, extract the IDs from the URL
                const [, guildId, channelId, messageId] = linkMatch;
                if (guildId !== interaction.guild.id) {
                    await interaction.reply({ content: 'The message link is from another server and cannot be accessed.', ephemeral: true });
                    return;
                }
                messageToSave = await interaction.client.channels.cache.get(channelId)?.messages.fetch(messageId);
            } else {
                // If not a link, attempt to fetch directly from the current channel
                messageToSave = await interaction.channel.messages.fetch(messageIdentifier);
            }

            if (!messageToSave) {
                await interaction.reply({ content: 'Unable to find the message. Please check the ID or link provided.', ephemeral: true });
                return;
            }

            const messageUrl = `https://discord.com/channels/${interaction.guild.id}/${messageToSave.channel.id}/${messageToSave.id}`;

            const member = await interaction.guild.members.fetch(messageToSave.author.id).catch(console.error);
            const authorName = member?.nickname ? member.nickname : messageToSave.author.username;

            const embed = new EmbedBuilder()
                .setTitle('Saved Message')
                .setURL(messageUrl)
                .setAuthor({ name: authorName, iconURL: messageToSave.author.displayAvatarURL() })
                .setTimestamp(new Date(messageToSave.createdTimestamp))
                .setColor("Green")
                .setFooter({ text: 'Message saved by ' + authorName, iconURL: interaction.user.displayAvatarURL() });

            if (messageToSave.content) {
                embed.setDescription(messageToSave.content);
            }

            const imageAttachments = messageToSave.attachments.filter(att => att.contentType && att.contentType.startsWith('image/'));
            if (imageAttachments.size > 0) {
                embed.setImage(imageAttachments.first().url);
            }

            await targetChannel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Message saved!', ephemeral: true });
        } catch (error) {
            console.error('Error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true }).catch(console.error);
            }
        }
    }


};
