const AppUsages = require('../models/appUsages');

const getUserList = (packageName) => {
    return AppUsages.find({packageName: packageName}).sort({totalUsedTime: -1}).exec();
};

module.exports = { getUserList };