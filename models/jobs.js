const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobsSchema = new Schema({
    jobName: String,
    time: String,
    type: String
});

module.exports = mongoose.model('jobs', jobsSchema);
