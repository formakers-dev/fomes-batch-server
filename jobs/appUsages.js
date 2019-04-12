const AppUsages = require('../models/appUsages');

const removeOldUsages = () => {
    const currentTime = new Date().getTime();
    const weekInMillisecond = 1000 * 60 * 60 * 24 * 7;

    return AppUsages.remove({
        $or: [
            {"updateTime": {$exists: false}},
            {"updateTime": {$lte: new Date(currentTime - weekInMillisecond)}}
        ]});
};

module.exports = {removeOldUsages};