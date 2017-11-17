const Projects = require('../models/projects');

const getPackageNameList = () => {
    const currentDate = new Date();

    return Projects.aggregate([
        { $unwind: { path : '$interview' }},
        { $match :
                { $and:
                        [ { 'interview.startDate': { $lte: currentDate } },
                            {'interview.endDate': { $gte: currentDate } } ]
                }
        },
        { $project : { 'projectId' : true, 'interviewSeq' : '$interview.seq', 'app' : '$interview.apps' }},
        { $unwind : { path : '$app'}}
    ]).exec();
};

module.exports = { getPackageNameList };