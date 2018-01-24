const Jobs = require('../models/jobs');

const getBatchJobs = (time) => {
    return Jobs.find({time: time}).exec();
};

module.exports = {getBatchJobs};