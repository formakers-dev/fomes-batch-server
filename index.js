const Agenda = require('agenda');
const config = require('./config');
const { getUserList } = require('./jobs/appUsages');
const { getPackageNameList } = require('./jobs/projects');
const { getNotificationToken } = require('./jobs/users');

require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

agenda.define('get similar app list each interview', (job, done) => {
    console.log('get similar app list each interview');
    getPackageNameList().then((result) => {
        console.log(result);
        agenda.now('get user list for packagename', { appListByInterview : result });
        done();
    }).catch(err => {
        console.log(err);
        done(err)
    });
});

agenda.define('get user list for packagename', function(job, done) {
    console.log('get user list for packagename');
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

agenda.on('ready', function() {
    console.log('agenda start!');
    // agenda.now('get similar app list each interview');
    // agenda.every('3 second', 'get userlist for packagename');

    agenda.start();
});