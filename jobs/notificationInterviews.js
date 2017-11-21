const NotificationInterviews = require('../models/notificationInterviews');

const getAllNotificationInterviews = () => {
    return NotificationInterviews.find({}).exec();
};

const addNotificationInterview = (interviewInfo) => {
    return NotificationInterviews.create({
        projectId: interviewInfo.projectId,
        interviewSeq: interviewInfo.interviewSeq,
        userIds: interviewInfo.userIds
    });
};

const removeNotificationInterview = (interviewInfo) => {
    return NotificationInterviews.remove({projectId: interviewInfo.projectId, interviewSeq: interviewInfo.interviewSeq});
};

module.exports = {getAllNotificationInterviews, addNotificationInterview, removeNotificationInterview};