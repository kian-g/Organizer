require('../customLogger');

//Delete and refresh commands

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientID, guildID, token } = require('./config.json'); // Ensure you have these in your config

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Clears all global commands
    await rest.put(Routes.applicationCommands(clientID), { body: [] });
    console.log('Successfully deleted all global application commands.');

    // Clears all commands for a specific guild
    await rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: [] });
    console.log(`Successfully deleted all application commands for guild ${guildID}.`);

    // Re-register commands here with the updated list from your bot's code
    // This is an example, replace with your actual commands array
    const commands = [];

    // Registers commands for the specific guild
    await rest.put(
      Routes.applicationGuildCommands(clientID, guildID),
      { body: commands },
    );

    console.log('Successfully re-registered application commands.');
  } catch (error) {
    console.error(error);
  }
})();
