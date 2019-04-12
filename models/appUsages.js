const mongoose = require('mongoose');
const connection = require('../db').FOMES;
const Schema = mongoose.Schema;

const appUsagesSchema = new Schema({
    packageName: String,
    userId: String,
    totalUsedTime: Number,
    updateTime: Date,
});

module.exports = connection.model('app-usages', appUsagesSchema);
