const AppUsages = require('../models/appUsages');

const getUserList = (appListByInterview) => {
    const appList = appListByInterview.map(interview => interview.app);
    return AppUsages.find({packageName: {$in : appList}}).sort({totalUsedTime: -1}).exec();
};

module.exports = { getUserList };