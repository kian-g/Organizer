const mongoose = require('mongoose');

const userSettingSchema = new mongoose.Schema({
    userId: String,
    embedColor: String,
});

module.exports = mongoose.model('UserSetting', userSettingSchema);
