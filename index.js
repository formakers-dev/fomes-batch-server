const Agenda = require('agenda');
const config = require('./config');
const { getUserList } = require('./jobs/appUsages');
const { getPackageNameList } = require('./jobs/projects');
const { getNotificationToken } = require('./jobs/users');
const { sendNotification } = require('./jobs/notification');

require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

agenda.define('get similar app list each interview', (job, done) => {
    console.log('get similar app list each interview');
    getPackageNameList().then((result) => {
        console.log(result);
        agenda.now('get user list for package name', { appListByInterview : result });
        done();
    }).catch(err => {
        console.log(err);
        done(err)
    });
});

agenda.define('get user list for package name', function(job, done) {
    console.log('get user list for package name');
    const appListByInterview = job.attrs.data.appListByInterview;

    console.log(appListByInterview);
    getUserList(appListByInterview).then((result) => {
        console.log(result);
        done();
    }).catch(err => {
        console.log(err);
        done(err)
    });
});

agenda.define('get notification token list each user', function(job, done) {
    console.log('get notification token list each user');
    const appUsageList = job.attrs.data.appUsageList;

    getNotificationToken(appUsageList).then(result => {
        console.log(result);
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('send notification to users', function(job, done) {
    const notificationIdList = job.attrs.data.notificationIdList;
    sendNotification(notificationIdList).then(result => {
        console.log(result);
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.on('ready', function() {
    console.log('agenda start!');
    // agenda.now('get similar app list each interview');
    // agenda.every('3 second', 'get user list for package name');

    agenda.start();
});