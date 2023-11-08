const UserSetting = require('../models/UserSetting');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcolor')
        .setDescription('Sets your embed color preference.')
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Select a color for your embeds')
                .addChoices(
                    { name: 'Green', value: 'Green' },
                    { name: 'Dark Aqua', value: 'DarkAqua' },
                    { name: 'Dark Green', value: 'DarkGreen' },
                    { name: 'Blue', value: 'Blue' },
                    { name: 'Dark Blue', value: 'DarkBlue' },
                    { name: 'Purple', value: 'Purple' },
                    { name: 'Dark Purple', value: 'DarkPurple' },
                    { name: 'Luminous Vivid Pink', value: 'LuminousVividPink' },
                    { name: 'Dark Vivid Pink', value: 'DarkVividPink' },
                    { name: 'Gold', value: 'Gold' },
                    { name: 'Dark Gold', value: 'DarkGold' },
                    { name: 'Orange', value: 'Orange' },
                    { name: 'Dark Orange', value: 'DarkOrange' },
                    { name: 'Red', value: 'Red' },
                    { name: 'Dark Red', value: 'DarkRed' },
                    { name: 'Grey', value: 'Grey' },
                    { name: 'Dark Grey', value: 'DarkGrey' },
                    { name: 'Darker Grey', value: 'DarkerGrey' },
                    { name: 'Light Grey', value: 'LightGrey' },
                    { name: 'Navy', value: 'Navy' },
                    { name: 'Dark Navy', value: 'DarkNavy' },
                    { name: 'Yellow', value: 'Yellow' }
                )

                .setRequired(true)),

    async execute(interaction) {
        const selectedColorValue = interaction.options.getString('color');
        const selectedColorName = interaction.options.getString('color', true); // Using the required option to get the color name

        // Update the user's setting in the database
        const filter = { userId: interaction.user.id };
        const update = { embedColor: selectedColorValue };
        await UserSetting.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true // This creates the document if it doesn't exist
        });

        await interaction.reply({ content: `Your embed color has been set to ${selectedColorName}.`, ephemeral: true });
    },
};
