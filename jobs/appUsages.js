const AppUsages = require('../models/appUsages');

const getAppUsedUserList = (interviewInfo) => {
    return AppUsages.find({packageName: {$in: interviewInfo.apps}, userId: {$nin: interviewInfo.notifiedUserIds}})
        .sort({totalUsedTime: -1})
        .exec();
};

module.exports = {getAppUsedUserList};