const Agenda = require('agenda');
const config = require('./config');
const {getAppUsedUserList, removeOldUsages} = require('./jobs/appUsages');
const {getInterviewInfoListForNotification, addNotifiedUserIds, getClosedInterviews} = require('./jobs/projects');
const {getUserNotificationTokenList} = require('./jobs/users');
const {sendNotification} = require('./jobs/notification');
const {runCrawlerForUncrawledApps} = require('./jobs/crawling');
const {addNotificationInterview, getNotificationInterviews, removeNotificationInterview} = require('./jobs/notificationInterviews');
const {backup} = require('./jobs/backupShortTermStats');
const {getBatchJobs} = require('./jobs/jobs');
require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

agenda.define('get interview infos for notification', (job, done) => {
    console.log('[job] =====> get interview infos for notification' + new Date());

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
    const notificationType = job.attrs.data.notificationType;
    getNotificationInterviews(notificationType).then((interviewArray) => {
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

    sendNotification(notificationIdList, interviewInfo).then(() => {
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
/** End of 노티 전송 플로우 **/

/** 언크롤드 앱 크롤링 **/
agenda.define('run crawling for uncrawled apps', function (job, done) {
    console.log('[job] =====> run crawling for uncrawled apps' + new Date());
    runCrawlerForUncrawledApps();
    done();
});

/** 단기통계 데이터 백업 **/
agenda.define('backup for shortTermStats', function (job, done) {
    console.log('[job] =====> backup for shortTermStats' + new Date());
    const date = new Date().toISOString();
    const path = config.backup.outputPath + 'backup-short-term-stats-'+date+'.json';
    backup(path);
    done();
});

/** 오래된 앱 사용정보 삭제 **/
agenda.define('remove old app-usages', function(job, done) {
    console.log('[job] =====>  remove old app-usages' + new Date());

    removeOldUsages()
        .then(() => {
            console.log('remove old app-usages done');
            done();
        })
        .catch(err => done(err));
});

// deprecated??????
// 확정된 인터뷰에 대한 노티 보내기 - DB 거치지 않음
agenda.define('start to send notification for closed interviews', function(job, done) {
    console.log('[job] start to send notification for closed interviews');

    getClosedInterviews().then((closedInterviewInfos) => {
        console.log('getClosedInterviews - Completed (' + closedInterviewInfos.length + ')');

        closedInterviewInfos.forEach(interviewInfo => {
            console.log('closedInterviewInfo seq=' + interviewInfo.interviewSeq + ",projectId=" + interviewInfo.projectId);
            agenda.now('get notification token list each user', { interviewInfo:  interviewInfo});
        });

        console.log('start to send notification for closed interviews done');
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('observe notification', function(job, done) {
    console.log('[job] =====>  observe notification' + new Date());

    const time = getNotificationBaseHourMinute();

    if(time == null) {
        console.log('[observe notification] out of time');
        done();
    } else {
        getBatchJobs(time).then((batchJobs) => {
            batchJobs.forEach(batchJob => {
                agenda.now(batchJob.jobName, {notificationType: batchJob.type});
            });
            done();
        });
    }
});

const getNotificationBaseHourMinute = () => {
    const date = new Date();

    if(date.getMinutes()>25 && date.getMinutes()<35) {
        return date.getHours() + ":30";
    }else if(date.getMinutes()>55){
        return (date.getHours()+1) + ":00";
    }else if(date.getMinutes()<5){
        return date.getHours() + ":00";
    } else {
        return null;
    }
};

agenda.on('ready', function () {
    console.log('Agenda start with', process.env.NODE_ENV);

    agenda.jobs({}, (err, jobs) => {
        // 기존 Job정보 제거
        if (jobs && jobs.length > 0) {
            jobs.forEach(job => job.remove());
        }

        // 백업 batch: 4:00
        agenda.every('0 4 * * *', 'backup for shortTermStats');
        // 오래된 앱사용정보 삭제: 4:30
        agenda.every('30 4 * * *', 'remove old app-usages');
        // 노티 대상자 추출 batch: 1:00
        agenda.every('0 1 * * *', 'get interview infos for notification'); // cron 표현식 : '분 시 일 월 요일'
        // 언크롤드앱 크롤러 실행 batch: 2:30
        agenda.every('30 2 * * *', 'run crawling for uncrawled apps');
        // 노티 batch: 매 00분 30분
        agenda.every('*/30 * * * *', 'observe notification');

        agenda.start();
    });
});