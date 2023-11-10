const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require("../Config/config.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Submit a suggestion.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your suggestion')
                .setRequired(true)),

    async execute(interaction) {
        const suggestion = interaction.options.getString('message');
        const suggestionChannelId = config.suggestionChannel; // Channel ID where suggestions will be sent

        try {
            // Fetch the suggestion channel
            const suggestionChannel = await interaction.client.channels.fetch(suggestionChannelId);
            if (!suggestionChannel) {
                await interaction.reply({ content: `Suggestion channel not found. Please join the server in person to give feedback! ${config.supportServerLink}`, ephemeral: true });
                return;
            }

            // Create an embed for the suggestion
            const suggestionEmbed = new EmbedBuilder()
                .setTitle('New Suggestion')
                .setDescription(suggestion)
                .setColor('Random') // You can set a specific color if you prefer
                .setFooter({ text: `Suggested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Send the suggestion as an embed to the suggestion channel
            await suggestionChannel.send({ embeds: [suggestionEmbed] });

            // Confirm the submission to the user
            await interaction.reply({ content: 'Your suggestion has been submitted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Failed to submit suggestion:', error);
            await interaction.reply({ content: `There was an error while submitting your suggestion. Please join the server in person to give feedback! ${config.supportServerLink}`, ephemeral: true });
        }
    },
};
