const NotificationInterviews = require('../models/notificationInterviews');

const getNotificationInterviews = (notificationType) => {
    return NotificationInterviews.find({notificationType: notificationType}).exec();
};

const addNotificationInterview = (interviewInfo) => {
    return NotificationInterviews.create({
        projectId: interviewInfo.projectId,
        interviewSeq: interviewInfo.interviewSeq,
        projectName: interviewInfo.projectName,
        projectIntroduce: interviewInfo.projectIntroduce,
        userIds: interviewInfo.userIds,
        notificationType: interviewInfo.notificationType
    });
};

const removeNotificationInterview = (interviewInfo) => {
    return NotificationInterviews.remove({projectId: interviewInfo.projectId, interviewSeq: interviewInfo.interviewSeq, notificationType: interviewInfo.notificationType});
};

module.exports = {getNotificationInterviews, addNotificationInterview, removeNotificationInterview};