# Discord Autosave Bot

The Discord Autosave Bot is a sophisticated tool designed for Discord server administrators and users who need a reliable way to archive messages. This bot provides an efficient solution for saving messages within your Discord channels, ensuring that no important information is lost.

## Features
- Message Auto-Save: Automatically captures and saves messages from specified users in a dedicated channel.
- Selective Tracking: Offers the flexibility to monitor specific users or all users within a channel.
- Timely Message Deletion: Mirrors the deletion of messages in real-time, provided they are deleted within 45 seconds of posting.
- Customizable Embed Colors: Allows users to personalize the appearance of saved message embeds with a custom color.
- User-Friendly Help System: Provides a /help command that lists all available commands and their usage.
- Controlled Tracking: Empowers users to stop tracking messages with a simple /stop command.
- Visibility of Tracking: Users can view a list of all currently tracked users with the /tracking command.

<img style="float: right;" src="https://media.discordapp.net/attachments/1171633129270812674/1172045751153606676/YumYum_brain_3ac4f244-5176-487e-83c6-de5536ea4e7d.png?ex=655ee3aa&is=654c6eaa&hm=36f4833b59a868bbab0c8228332081a2bd89863c85e0adea748743e78aacfb78&=&width=935&height=935" />

## Commands
- `/auto [channel] [user]`: Initiates autosaving of messages for a specific user.
- `/help`: Displays detailed information about how to use the bot's commands.
- `/save [channel_to_save_to] [message_identifier]`: Saves a specified message.
- `/setcolor [color]`: Sets the user's preferred color for message embeds.
- `/stop [user/all]`: Discontinues message tracking for a specific user or all users.
- `/tracking`: Lists all users whose messages are being tracked.

## Dependencies
- [discord.js](https://discord.js.org/): A powerful library for interacting with the Discord API.
- [mongoose](https://mongoosejs.com/): Elegant MongoDB object modeling for Node.JS.
- [@discordjs/rest](https://www.npmjs.com/package/@discordjs/rest): REST manager for Discord's HTTP API.
- [@discord-api-types](https://www.npmjs.com/package/discord-api-types): Types for Discord's HTTP API.

## Contribution
Contributions to the bot's development are welcome. For bugs or feature requests, please file an issue. For direct contributions, please submit a pull request with a clear explanation of the changes.