const mongoose = require('mongoose');
const connection = require('../db').FOMES;

const shortTermStatsSchema = new mongoose.Schema({
    userId: String,
    packageName: String,
    startTimeStamp: Number,
    endTimeStamp: Number,
    totalUsedTime: Number
});

const shortTermStatsList = connection.model('short-term-stats', shortTermStatsSchema);
const backupShortTermStatsList = connection.model('backup-short-term-stats', shortTermStatsSchema);

module.exports = { backupShortTermStatsList, shortTermStatsList };