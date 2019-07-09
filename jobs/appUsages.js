const AppUsages = require('../models/appUsages');

const removeOldUsages = () => {
    const currentTime = new Date().getTime();
    const monthInMillisecond = 1000 * 60 * 60 * 24 * 31;

    return AppUsages.deleteMany({
        $or: [
            {"date": {$exists: false}},
            {"date": {$lte: new Date(currentTime - monthInMillisecond)}}
        ]
    });
};

module.exports = {removeOldUsages};