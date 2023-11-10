const { SlashCommandBuilder } = require('@discordjs/builders');

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
        const suggestionChannelId = '1172658205562769548'; // Channel ID where suggestions will be sent

        try {
            // Fetch the suggestion channel
            const suggestionChannel = await interaction.client.channels.fetch(suggestionChannelId);
            if (!suggestionChannel) {
                await interaction.reply({ content: 'Suggestion channel not found. Please join the server in person to give feedback! https://discord.gg/AA2HM5Pw4H', ephemeral: true });
                return;
            }

            // Send the suggestion to the suggestion channel
            await suggestionChannel.send({ content: `New suggestion from ${interaction.user.tag}: ${suggestion}` });

            // Confirm the submission to the user
            await interaction.reply({ content: 'Your suggestion has been submitted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Failed to submit suggestion:', error);
            await interaction.reply({ content: 'There was an error while submitting your suggestion. Please join the server in person to give feedback! https://discord.gg/AA2HM5Pw4H', ephemeral: true });
        }
    },
};
