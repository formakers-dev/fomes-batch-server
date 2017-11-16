const AppUsages = require('./models/appUsages');
const Agenda = require('agenda');
const config = require('./config');
require('./db').init();

var mongoConnectionString = config.dbUrl;
var agenda = new Agenda({db: {address: mongoConnectionString}});

agenda.define('get userlist for packagename', function(job, done) {
    console.log('get userlist for packagename');
    AppUsages.find({packageName: 'com.nhn.android.search'})
        .then((result) => {
            console.log(result);
            done();
        }).catch(err => {
            console.log(err);
            done(err)
    });
});

agenda.on('ready', function() {
    console.log('agenda start!');
    agenda.every('10 second', 'get userlist for packagename');

    agenda.start();
});