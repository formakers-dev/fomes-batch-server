const Agenda = require('agenda');
const config = require('./config');
const {getAppUsedUserList} = require('./jobs/appUsages');
const {getInterviewInfoListForNotification, addNotifiedUserIds, getClosedInterviews} = require('./jobs/projects');
const {getUserNotificationTokenList} = require('./jobs/users');
const {sendNotification} = require('./jobs/notification');
const {insertUncrawledApps} = require('./jobs/uncrawledApps');
const {addNotificationInterview, getAllNotificationInterviews, removeNotificationInterview} = require('./jobs/notificationInterviews');
const {backup} = require('./jobs/shortTermStats');

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

agenda.define('add interviewInfo with userIds to notification-interviews collection', function (job, done) {
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

/** Start of 노티 전송 플로우 **/
agenda.define('start to send notification', function (job, done) {
    console.log('[job] start to send notification');

    getAllNotificationInterviews().then((interviewArray) => {
        console.log(interviewArray);

        interviewArray.forEach(interviewInfo => {
            agenda.now('get notification token list each user', {interviewInfo: interviewInfo});
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

        agenda.now('send notification to users', {
            notificationIdList: notificationIdList,
            interviewInfo: interviewInfo
        });

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

    sendNotification(notificationIdList, interviewInfo).then(response => {
        if (interviewInfo.notiType === '모집') {
            agenda.now('remove notification-interviews collection', {interviewInfo: interviewInfo});
        }
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
/** End of 노티 전송 플로우 **/

agenda.define('insert uncrawled-apps from apps and app-usages', function (job, done) {
    console.log('[job] insert uncrawled-apps from apps and app-usages');
    insertUncrawledApps().then(() => {
        console.log('insert uncrawled-apps from apps and app-usages done');
        done();
    })
});

agenda.define('backup for shortTermStats', function (job, done) {
    console.log('[job] backup for shortTermStats');

    backup(new Date().getTime() - 30 * 60 * 1000, '/Users/act/backup/short-term-stats-backup').then((result) => {
        console.log('backup for shortTermStats done');
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

// 확정된 인터뷰에 대한 노티 보내기 - DB 거치지 않음
agenda.define('start to send notification for closed interviews', function(job, done) {
    console.log('[job] start to send notification for closed interviews');

    getClosedInterviews().then((closedInterviewInfos) => {
        console.log('getClosedInterviews - Completed (' + closedInterviewInfos.length + ')');

        closedInterviewInfos.forEach(interviewInfo => {
            console.log('closedInterviewInfo seq=' + interviewInfo.interviewSeq);
            agenda.now('get notification token list each user', { interviewInfo:  interviewInfo});
        });

        console.log('start to send notification for closed interviews done');
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.on('ready', function () {
    console.log('agenda start!');

    agenda.jobs({}, (err, jobs) => {
        if (jobs && jobs.length > 0) {
            jobs.forEach(job => job.remove());
        }

        // batch
        agenda.processEvery('12 14 * * *', 'get interview infos for notification'); // cron 표현식 : '분 시 일 월 요일'
        agenda.processEvery('15 12 * * *', 'start to send notification');

        // test
        // agenda.every('30 seconds', 'get interview infos for notification'); // cron 표현식 : '분 시 일 월 요일'
        // agenda.every('30 seconds', 'start to send notification');
        // agenda.now('insert uncrawled-apps from apps and app-usages');
        // agenda.now('backup for shortTermStats');

        agenda.start();
    });
});