require('./consoleChalk');

// index.js
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, MessageAttachment } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const mongoose = require('mongoose');
const AutoSaveSetting = require('./models/AutoSaveSetting'); // Make sure this path is correct
const config = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent, // If you need to read message contents
    ]
});

client.commands = new Collection();
client.autoSaveSettings = new Map();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// MongoDB connection
mongoose.connect(config.mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to the database.');
}).catch((err) => {
    console.error('Database connection error:', err);
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Load auto-save settings from the database into memory for quick access
    const allAutoSaveSettings = await AutoSaveSetting.find({ autoSaveActive: true });
    allAutoSaveSettings.forEach(setting => {
        const key = `${setting.guildId}-${setting.userId}`;
        client.autoSaveSettings.set(key, setting);
    });

    // Refreshing commands each time the bot starts is not always necessary, especially for production bots.
    // It's generally better to have a separate script for updating commands.
    const rest = new REST({ version: '9' }).setToken(config.token);
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.clientID),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

const autoCommand = require('./commands/auto.js'); // Import the auto.js module

client.on('messageCreate', async message => {
    try {
        // Construct the key for the autoSaveSettings map using the author's ID
        const key = `${message.guildId}-${message.author.id}`;
        const setting = client.autoSaveSettings.get(key);

        // If a setting is found and the message is from the tracked user, handle autosave
        if (setting) {
            await autoCommand.handleAutoSave(message, setting, client);
        }
    } catch (error) {
        console.error('Error in messageCreate event:', error.stack || error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(config.token);
