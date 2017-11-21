const Projects = require('../models/projects');

const getInterviewInfoListForNotification = () => {
    const currentDate = new Date();

    return Projects.aggregate([
        {$unwind: {path: '$interviews'}},
        {
            $match:
                {
                    $and:
                        [{'interviews.openDate': {$lte: currentDate}},
                            {'interviews.closeDate': {$gte: currentDate}}]
                }
        },
        {$project: {'projectId': true, 'interviewSeq': '$interviews.seq', 'apps': '$interviews.apps', 'notifiedUserIds': '$interviews.notifiedUserIds'}},
    ]).exec();
};

const addNotifiedUserIds = (interviewInfo) => {
    return Projects.findOneAndUpdate(
        {
            'projectId': interviewInfo.projectId,
            'interviews.seq': interviewInfo.interviewSeq,
        },
        {$push: {'interviews.$.notifiedUserIds': {$each: interviewInfo.userIdList}}},
        {upsert: true}).exec();
};

module.exports = {getInterviewInfoListForNotification, addNotifiedUserIds};