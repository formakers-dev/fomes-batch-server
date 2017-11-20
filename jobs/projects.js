const Projects = require('../models/projects');

const getPackageNameList = () => {
    const currentDate = new Date();

    return Projects.aggregate([
        { $unwind: { path : '$interviews' }},
        { $match :
                { $and:
                        [ { 'interviews.openDate': { $lte: currentDate } },
                          { 'interviews.closeDate': { $gte: currentDate } } ]
                }
        },
        { $project : { 'projectId' : true, 'interviewSeq' : '$interviews.seq', 'app' : '$interviews.apps' }},
        { $unwind : { path : '$app'}}
    ]).exec();
};

module.exports = { getPackageNameList };