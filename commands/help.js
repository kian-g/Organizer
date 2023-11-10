require('../customLogger');

const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information for available commands'),

    async execute(interaction) {
        // Create a base EmbedBuilder
        const { EmbedBuilder } = require('discord.js');
        const helpEmbed = new EmbedBuilder()
            .setTitle('Help: List of Commands')
            .setColor('Gold')
            .setDescription('Here are the commands you can use:');

        // Read the command files
        const commandFiles = fs.readdirSync(path.join(__dirname, './')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./${file}`);
            let commandDescription = `${command.data.description}`;

            // If the command has options, add them to the description
            if (command.data.options?.length) {
                commandDescription += '\nOptions:\n';
                for (const option of command.data.options) {
                    commandDescription += `  • **${option.name}**: ${option.description}\n`;
                }
            }

            // Format the field to show the command as a block
            helpEmbed.addFields({
                name: `/${command.data.name}`,
                value: commandDescription,
                inline: false // Set to false to ensure each command appears as its own block
            });
        }

        // Send the embed to the user
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },
};
