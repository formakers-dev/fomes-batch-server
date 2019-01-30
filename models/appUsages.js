const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appUsagesSchema = new Schema({
    packageName: String,
    userId: String,
    totalUsedTime: Number,
    updateTime: Date,
});

module.exports = mongoose.model('app-usages', appUsagesSchema);
