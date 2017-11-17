const Projects = require('../models/projects');

const getPackageNameList = () => {
    const currentDate = new Date();

    return Projects.aggregate([
        { $unwind: { path : '$interviews' }},
        { $match :
                { $and:
                        [ { 'interviews.startDate': { $lte: currentDate } },
                            {'interviews.endDate': { $gte: currentDate } } ]
                }
        },
        { $project : { 'projectId' : true, 'interviewSeq' : '$interviews.seq', 'app' : '$interviews.apps' }},
        { $unwind : { path : '$app'}}
    ]).exec();
};

module.exports = { getPackageNameList };