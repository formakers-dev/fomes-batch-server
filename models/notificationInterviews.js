const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationInterviewsSchema = new Schema({
    projectId: Number,
    interviewSeq: Number,
    userIds: Array
});

module.exports = mongoose.model('notification-interviews', notificationInterviewsSchema);