const Users = require('../models/users');

const getUserNotificationTokenList = (userIdList) => {
    return Users.find({userId: {$in: userIdList}}).exec();
};

module.exports = {getUserNotificationTokenList};