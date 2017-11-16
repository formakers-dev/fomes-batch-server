const Agenda = require('agenda');
const config = require('./config');
const { getUserList } = require('./jobs/appUsages');
const { getPackageNameList } = require('./jobs/projects');

require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

agenda.define('get userlist for packagename', function(job, done) {
    console.log('get userlist for packagename');
    getUserList('com.nhn.android.search').then((result) => {
        console.log(result);
        done();
    }).catch(err => {
        console.log(err);
        done(err)
    });
});

agenda.define('get package name list', (job, done) => {
    console.log('get package name list');
    getPackageNameList().then((result) => {
        console.log(result);
        done();
    }).catch(err => {
        console.log(err);
        done(err)
    });
});

agenda.on('ready', function() {
    console.log('agenda start!');
    // agenda.now('get package name list');
    // agenda.every('3 second', 'get userlist for packagename');

    agenda.start();
});