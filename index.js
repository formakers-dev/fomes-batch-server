const Agenda = require('agenda');
const config = require('./config');
const {getAppUsedUserList} = require('./jobs/appUsages');
const {getInterviewInfoListForNotification, addNotifiedUserIds} = require('./jobs/projects');
const {getUserNotificationTokenList} = require('./jobs/users');
const {sendNotification} = require('./jobs/notification');
const {addNotificationInterview, getAllNotificationInterviews, removeNotificationInterview} = require('./jobs/notificationInterviews');

require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

agenda.define('get interview infos for notification', (job, done) => {
    console.log('[job] get interview infos for notification');

    getInterviewInfoListForNotification().then((interviewInfoList) => {
        console.log(interviewInfoList);
        interviewInfoList.forEach(interviewInfo => {
            agenda.now('get target user list for interview', {interviewInfo: interviewInfo});
        });
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('get target user list for interview', function (job, done) {
    console.log('[job] get target user list for interview');
    const interviewInfo = job.attrs.data.interviewInfo;

    getAppUsedUserList(interviewInfo).then((appUsedUserList) => {
        console.log(appUsedUserList);

        if (appUsedUserList && appUsedUserList.length > 0) {
            interviewInfo.userIds = appUsedUserList.map(user => user.userId);
            addNotifiedUserIds(interviewInfo).then(() => {
                console.log('addNotifiedUserIds done');
                agenda.now('add interviewInfo with userIds to notification-interviews collection', {interviewInfo: interviewInfo});
                done();
            }).catch(err => {
                console.log(err);
                done(err);
            });
        } else {
            done();
        }
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('add interviewInfo with userIds to notification-interviews collection', function(job, done) {
    console.log('[job] add interviewInfo with userIds to notification-interviews collection');
    const interviewInfo = job.attrs.data.interviewInfo;

    addNotificationInterview(interviewInfo).then(() => {
        console.log('addNotificationInterview done');
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('start to send notification', function(job, done) {
    console.log('[job] start to send notification');

    getAllNotificationInterviews().then((interviewArray) => {
        console.log(interviewArray);

        interviewArray.forEach(interviewInfo => {
            agenda.now('get notification token list each user', {interviewInfo : interviewInfo});
        });

        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});


agenda.define('get notification token list each user', function (job, done) {
    console.log('[job] get notification token list each user');
    const interviewInfo = job.attrs.data.interviewInfo;

    getUserNotificationTokenList(interviewInfo.userIds).then(userTokenList => {
        console.log(userTokenList);

        const notificationIdList = userTokenList.map(userToken => userToken.registrationToken);

        agenda.now('send notification to users', {notificationIdList: notificationIdList, interviewInfo: interviewInfo});

        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('send notification to users', function (job, done) {
    console.log('[job] send notification to users');
    const notificationIdList = job.attrs.data.notificationIdList;
    const interviewInfo = job.attrs.data.interviewInfo;

    sendNotification(notificationIdList, interviewInfo.projectId, interviewInfo.interviewSeq, interviewInfo.projectName, interviewInfo.projectIntroduce).then(response => {
        console.log('sendNotification done');
        agenda.now('remove notification-interviews collection', {interviewInfo: interviewInfo});
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('remove notification-interviews collection', function (job, done) {
    console.log('[job] remove notification-interviews collection');
    const interviewInfo = job.attrs.data.interviewInfo;

    removeNotificationInterview(interviewInfo).then(() => {
        console.log('removeNotificationInterview done');
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.on('ready', function () {
    console.log('agenda start!');

    agenda.jobs({}, (err, jobs) => {
        if(jobs && jobs.length > 0) {
            jobs.forEach(job => job.remove());
        }

        // batch
        agenda.every('53 11 * * *', 'get interview infos for notification'); // cron 표현식 : '분 시 일 월 요일'
        agenda.every('55 11 * * *', 'start to send notification');

        // test
        // agenda.every('30 seconds', 'get interview infos for notification'); // cron 표현식 : '분 시 일 월 요일'
        // agenda.every('30 seconds', 'start to send notification');

        agenda.start();
    });
});