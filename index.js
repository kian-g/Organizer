require('./consoleChalk');

const { Client, Collection, Partials, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Discord bot token and client ID
const config = require("./config.json")
const token = config.token;
const clientId = config.clientID;
const guildId = config.guildID; // if you want to register commands to a specific guild during development
const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://kian:giuliano@userprefs.aa3zxy7.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        // Fetch all commands from the guild
        const existingCommands = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId)
        );

        // Delete commands that are no longer in the commands folder
        for (const existingCommand of existingCommands) {
            if (!commands.some(cmd => cmd.name === existingCommand.name)) {
                await rest.delete(
                    Routes.applicationGuildCommand(clientId, guildId, existingCommand.id)
                );
                console.log(`Deleted old command: ${existingCommand.name}`);
            }
        }

        // Register new and updated commands
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
