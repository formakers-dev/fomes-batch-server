const NotificationInterviews = require('../models/notificationInterviews');

const getAllNotificationInterviews = () => {
    return NotificationInterviews.find({}).exec();
};

const addNotificationInterview = (interviewInfo) => {
    return NotificationInterviews.create({
        projectId: interviewInfo.projectId,
        interviewSeq: interviewInfo.interviewSeq,
        projectName: interviewInfo.projectName,
        projectIntroduce: interviewInfo.projectIntroduce,
        userIds: interviewInfo.userIds,
    });
};

const removeNotificationInterview = (interviewInfo) => {
    return NotificationInterviews.remove({projectId: interviewInfo.projectId, interviewSeq: interviewInfo.interviewSeq});
};

module.exports = {getAllNotificationInterviews, addNotificationInterview, removeNotificationInterview};