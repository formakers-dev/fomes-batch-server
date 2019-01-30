const AppUsages = require('../models/appUsages');

const getAppUsedUserList = (interviewInfo) => {
    const packageNames = interviewInfo.apps.map(app => app.packageName);

    return AppUsages.find({packageName: {$in: packageNames}, userId: {$nin: interviewInfo.notifiedUserIds}})
        .sort({totalUsedTime: -1})
        .limit(interviewInfo.totalCount)
        .exec();
};

const removeOldUsages = () => {
    const currentTime = new Date().getTime();
    const weekInMillisecond = 1000 * 60 * 60 * 24 * 7;

    return AppUsages.remove({ $or: [
            {"updateTime": { $exists: false }},
            {"updateTime": { $lte: new Date(currentTime - weekInMillisecond)}}
        ]});
};

module.exports = {getAppUsedUserList, removeOldUsages};