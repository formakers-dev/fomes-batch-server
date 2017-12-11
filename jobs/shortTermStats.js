const fs = require('fs');
const ShortTermStats = require('../models/shortTermStats');

const backup = (endTime, filePath) => {
    return getAllFromEndTime(endTime).then((result) => {
        writeBackupFile(result, filePath);
        return result;
    }).then((result) => {
        return removeShortTermStats(result.map(item => item._id));
    })
};

const getAllFromEndTime = (endTime) => {
    return ShortTermStats.find({endTimeStamp : {$lte : endTime}}).exec();
};

const writeBackupFile = (data, filePath) => {
    const fd = fs.openSync(filePath, 'a');
    fs.writeSync(fd, data.toString() + ",");
    fs.closeSync(fd);
};

const removeShortTermStats = (ids) => {
    return ShortTermStats.remove({_id : { $in : ids}}).exec();
};

module.exports = {backup, getAllFromEndTime, writeBackupFile, removeShortTermStats};