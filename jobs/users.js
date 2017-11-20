const Users = require('../models/users');

const getUserNotificationTokenList = (appUsageList) => {
    const userList = appUsageList.map(appUsage => appUsage.userId);
    return Users.find({ userId : { $in : userList} }).exec();
};

module.exports = { getUserNotificationTokenList };