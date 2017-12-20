const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationInterviewsSchema = new Schema({
    projectId: Number,
    interviewSeq: Number,
    projectName: String,
    projectIntroduce: String,
    notificationType: String,
    userIds: Array
});

module.exports = mongoose.model('notification-interviews', notificationInterviewsSchema);