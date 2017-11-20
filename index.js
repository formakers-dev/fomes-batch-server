const Agenda = require('agenda');
const config = require('./config');
const { getUserList } = require('./jobs/appUsages');
const { getPackageNameList } = require('./jobs/projects');
const { getUserNotificationTokenList } = require('./jobs/users');
const { sendNotification } = require('./jobs/notification');

require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

agenda.define('get package name list each interview', (job, done) => {
    console.log('get package name list each interview');
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

    getUserList(appListByInterview).then((userList) => {
        console.log(userList);
        agenda.now('get notification token list each user', { userList : userList });
        done();
    }).catch(err => {
        console.log(err);
        done(err)
    });
});

agenda.define('get notification token list each user', function(job, done) {
    console.log('get notification token list each user');
    const userList = job.attrs.data.userList;

    getUserNotificationTokenList(userList).then(userTokenList => {
        console.log(userTokenList);
        const notificationIdList = userTokenList.map(userToken => userToken.registrationToken);
        agenda.now('send notification to users', { notificationIdList : notificationIdList });
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.define('send notification to users', function(job, done) {
    console.log('send notification to users');
    const notificationIdList = job.attrs.data.notificationIdList;

    sendNotification(notificationIdList).then(response => {
        console.log(response);
        done();
    }).catch(err => {
        console.log(err);
        done(err);
    });
});

agenda.on('ready', function() {
    console.log('agenda start!');
    // agenda.now('get package name list each interview');
    // agenda.every('3 second', 'get user list for package name');

    agenda.start();
});