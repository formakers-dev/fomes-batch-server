const Agenda = require('agenda');
const config = require('./config');
const {getAppUsedUserList} = require('./jobs/appUsages');
const {getInterviewInfoListForNotification, addNotifiedUserIds} = require('./jobs/projects');
const {getUserNotificationTokenList} = require('./jobs/users');
const {sendNotification} = require('./jobs/notification');

require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});
const notificationPushTime = '11:30';

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
            interviewInfo.userIdList = appUsedUserList.map(user => user.userId);
            addNotifiedUserIds(interviewInfo).then(() => {
                agenda.now('get notification token list each user', {interviewInfo: interviewInfo});
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

agenda.define('get notification token list each user', function (job, done) {
    console.log('[job] get notification token list each user');
    const userIdList = job.attrs.data.interviewInfo.userIdList;

    getUserNotificationTokenList(userIdList).then(userTokenList => {
        console.log(userTokenList);
        const notificationIdList = userTokenList.map(userToken => userToken.registrationToken);

        agenda.schedule(notificationPushTime, 'send notification to users', {notificationIdList: notificationIdList});

        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('send notification to users', function (job, done) {
    console.log('[job] send notification to users');
    const notificationIdList = job.attrs.data.notificationIdList;

    sendNotification(notificationIdList).then(response => {
        console.log(response);
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

        agenda.every('30 3 * * *', 'get interview infos for notification'); // cron 표현식 : '분 시 일 월 요일'
        agenda.start();
    });
});