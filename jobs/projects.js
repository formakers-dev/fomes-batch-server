const Projects = require('../models/projects');

const getInterviewInfoListForNotification = () => {
    //TODO : 글로벌 확산 시 로케일 고려되어야 함. 현재는 배치서버 로케일 기준따라감
    const currentDate = new Date();

    console.log('BASE DATE : ');
    console.log(currentDate);

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
        {
            $project: {
                'projectId': true,
                'interviewSeq': '$interviews.seq',
                'projectName': '$name',
                'projectIntroduce': '$introduce',
                'totalCount': '$interviews.totalCount',
                'apps': '$interviews.apps',
                'notifiedUserIds': '$interviews.notifiedUserIds',
                'notiType' : '모집',
            }
        },
    ]).exec();
};

const addNotifiedUserIds = (interviewInfo) => {
    return Projects.findOneAndUpdate(
        {
            'projectId': interviewInfo.projectId,
            'interviews.seq': interviewInfo.interviewSeq,
        },
        {$push: {'interviews.$.notifiedUserIds': {$each: interviewInfo.userIds}}},
        {upsert: true}).exec();
};

const getClosedInterviews = () => {
    const currentDate = new Date();
    console.log('getClosedInterviews - currentDate=' + currentDate);

    return Projects.aggregate([
        {$unwind: {path: '$interviews'}},
        {
            $match:
                {
                    $and:
                        [{'interviews.closeDate': {$lt: currentDate}},
                            {'interviews.interviewDate': {$gt: currentDate}}]
                }
        },
        {
            $project: {
                'projectId': true,
                'interviewSeq': '$interviews.seq',
                'projectName': '$name',
                'projectIntroduce': '$introduce',
                'interviewLocation': '$interviews.location',
                'interviewDate': '$interviews.interviewDate',
                'interviewTimeSlot': '$interviews.timeSlot',
                'totalCount': '$interviews.totalCount',
                'apps': '$interviews.apps',
                'notiType': '확정',
            }
        },
    ]).exec().then(projects => {
        return projects.map(interviewInfo => {
            const timeSlot = interviewInfo.interviewTimeSlot;
            interviewInfo.interviewTimeSlot = [];
            interviewInfo.assignedTimeSlot = Object.keys(timeSlot)
                .filter(timeSlotKey => (timeSlot[timeSlotKey] !== ''))
                .map(timeSlotKey => {
                    return {
                        time: timeSlotKey,
                        userId: timeSlot[timeSlotKey]
                    }
                });
            interviewInfo.userIds = interviewInfo.assignedTimeSlot.map(timeSlot => timeSlot.userId);

            return interviewInfo;
        });
    });
};

module.exports = {getInterviewInfoListForNotification, addNotifiedUserIds, getClosedInterviews};