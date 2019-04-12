const Agenda = require('agenda');
const config = require('./config');
const {removeOldUsages} = require('./jobs/appUsages');
const {runCrawlerForUncrawledApps, runCrawlerForRankedApps} = require('./jobs/crawling');
const {backup} = require('./jobs/backupShortTermStats');
const log = require('./utils/log');
require('./db').init();

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

/** 언크롤드 앱 크롤링 **/
agenda.define('run crawling for uncrawled apps', function (job, done) {
    log.info('job', 'run crawling for uncrawled apps' + new Date());
    runCrawlerForUncrawledApps();
    done();
});

/** 랭크드 앱 크롤링 **/
agenda.define('run crawling for ranked apps', function (job, done) {
    log.info('job', 'run crawling for ranked apps' + new Date());
    runCrawlerForRankedApps();
    done();
});

/** 단기통계 데이터 백업 **/
agenda.define('backup for shortTermStats', function (job, done) {
    log.info('job', 'backup for shortTermStats' + new Date());
    const date = new Date().toISOString();
    const path = config.backup.outputPath + 'backup-short-term-stats-'+date+'.json';
    backup(path);
    done();
});

/** 오래된 앱 사용정보 삭제 **/
agenda.define('remove old app-usages', function(job, done) {
    log.info('job', 'remove old app-usages' + new Date());

    removeOldUsages()
        .then(() => {
            log.info('appUsages', 'remove old app-usages done');
            done();
        })
        .catch(err => {
            log.error('appUsages', err.message);
            done(err);
        });
});

agenda.on('ready', function () {
    log.info('agenda', `start (${process.env.NODE_ENV})`);

    agenda.jobs({}, (err, jobs) => {
        // 기존 Job정보 제거
        if (jobs && jobs.length > 0) {
            jobs.forEach(job => job.remove());
        }

        // 랭크드 앱 크롤러 실행 batch: 매주 월요일 1:30
        agenda.every('30 1 * * MON', 'run crawling for ranked apps');
        // 언크롤드앱 크롤러 실행 batch: 2:30
        agenda.every('30 2 * * *', 'run crawling for uncrawled apps');

        // 단기통계데이터 백업 batch: 4:00
        agenda.every('0 4 * * *', 'backup for shortTermStats');
        // 오래된 앱사용정보 삭제: 4:30
        agenda.every('30 4 * * *', 'remove old app-usages');

        agenda.start();
    });
});
