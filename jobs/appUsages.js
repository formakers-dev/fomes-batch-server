const AppUsages = require('../models/appUsages');

const getAppUsedUserList = (interviewInfo) => {
    const packageNames = interviewInfo.apps.map(app => app.packageName);

    return AppUsages.find({packageName: {$in: packageNames}, userId: {$nin: interviewInfo.notifiedUserIds}})
        .sort({totalUsedTime: -1})
        .limit(interviewInfo.totalCount)
        .exec();
};

module.exports = {getAppUsedUserList};