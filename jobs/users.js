const Users = require('../models/users');

const getNotificationToken = (appUsageList) => {
    const userList = appUsageList.map(appUsage => appUsage.userId);
    return Users.find({ userId : { $in : userList} }).exec();
};

module.exports = { getNotificationToken };