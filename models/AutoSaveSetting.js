const mongoose = require("mongoose")

const autoSaveSettingSchema = new mongoose.Schema({
    userId: String, // The ID of the user who initiated autosave
    channelId: String, // The ID of the channel where messages are saved
    autoSaveActive: Boolean, // If the autosave is currently active
    targetUserId: String, // The ID of the user whose messages to autosave
    guildId: String, // The ID of the guild where the command was used.
    tag: {
        type: String,
        default: ''
    },
});

autoSaveSettingSchema.index({ userId: 1, guildId: 1, targetUserId: 1, channelId: 1 }, { unique: true });

module.exports = mongoose.model('AutoSaveSetting', autoSaveSettingSchema);
