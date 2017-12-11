const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uncrawledAppsSchema = new Schema({
    packageName: String,
});

module.exports = mongoose.model('uncrawled-apps', uncrawledAppsSchema);
