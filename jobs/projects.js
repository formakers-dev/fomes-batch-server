const Projects = require('../models/projects');

const getPackageNameList = () => {
    const currentDate = new Date();

    return Projects.aggregate([
        { $match :
                { $and:
                        [ { 'interview.startDate': { $lte: currentDate } },
                            {'interview.endDate': { $gte: currentDate } } ]
                }
        },
        { $project : { 'projectId' : true, 'interview.apps' : true }},
        { $unwind : { path : '$interview.apps'}},
        { $group : { _id: '$_id', projectId: {$first : '$projectId'}, app: { $push : '$interview.apps' }}},
        { $unwind : { path : '$app'}}
    ]).exec();
};

module.exports = { getPackageNameList };