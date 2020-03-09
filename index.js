const Agenda = require('agenda');
const config = require('./config');
const {removeOldUsages} = require('./jobs/appUsages');
const {runCrawlerForUncrawledApps, runCrawlerForRankedApps, runCrawlerToUpdateAppInfo} = require('./jobs/crawling');
const {backup} = require('./jobs/backupShortTermStats');
const {syncDataToStg, syncAppsDataToStg} = require('./jobs/syncDB');
const log = require('./utils/log');
const slack = require('./utils/slack');

const agenda = new Agenda({db: {address: config.agendaDBUrl, collection: 'agenda-jobs'}});

/** 언크롤드 앱 크롤링 **/
agenda.define('run crawling for uncrawled apps', function (job, done) {
    log.info('job', 'run crawling for uncrawled apps' + new Date());
    runCrawlerForUncrawledApps();
    done();
});

/** 앱사용정보가 존재하는 앱 정보 업데이트 크롤링 **/
agenda.define('run crawling to update app info', function (job, done) {
    log.info('job', 'run crawling to update app info' + new Date());
    runCrawlerToUpdateAppInfo();
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
    const path = config.backup.outputPath + 'backup-short-term-stats-' + date + '.json';
    backup(path);
    done();
});

/** 오래된 앱 사용정보 삭제 **/
agenda.define('remove old app-usages', function (job, done) {
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

agenda.define('send working message to slack', function (job, done) {
    slack.sendMessage('배치 서버 동작 중 👍', '#dev-build');
    done();
});

/** PrdDB => StgDB 데이터 자동 동기화 **/
agenda.define('sync from PrdDB to StgDB', function (job, done) {
    log.info('job', 'sync from PrdDB to StgDB');

    syncDataToStg('beta-tests');
    syncDataToStg('posts');
    // TODO: 베타테스트에 등록된 앱 정보만 가져와야함.
    syncAppsDataToStg()
        .then(() => done())
        .catch(err => done(err));
});

agenda.on('ready', function () {
    log.info('agenda', `Starting (${process.env.NODE_ENV})...`);

    log.info('agenda', 'Searching Previous Jobs...');

    agenda.jobs({})
        .then(jobs => {
            log.info('agenda', 'Removing Previous Jobs...');

            // 기존 Job정보 제거
            if (jobs && jobs.length > 0) {
                jobs.forEach(job => job.remove());
            }

            log.info('agenda', 'Registering New Jobs...');

            // 랭크드 앱 크롤러 실행 batch: 매주 월요일 1:30
            agenda.every('30 1 * * MON', 'run crawling for ranked apps');
            // PrdDB => StgDB 데이터 자동 동기화 batch: 매 주 월요일 3:30
            agenda.every('30 3 * * MON', 'sync from PrdDB to StgDB');
            // 앱사용정보가 존재하는 앱 정보 업데이트 크롤러 실행 batch: 매주 화요일 1:30
            agenda.every('30 1 * * TUE', 'run crawling to update app info');

            // 언크롤드앱 크롤러 실행 batch: 2:30
            agenda.every('30 2 * * *', 'run crawling for uncrawled apps');

            // 단기통계데이터 백업 batch: 4:00
            agenda.every('0 4 * * *', 'backup for shortTermStats');
            // 오래된 앱사용정보 삭제: 4:30
            agenda.every('30 4 * * *', 'remove old app-usages');

            // 생존신고 슬랙 메시지: 7:00
            agenda.every('0 7 * * *', 'send working message to slack');

            agenda.start();

            log.info('agenda', 'Successfully Started Agenda!!!');
        })
        .catch(err => log.error('agenda', err));
});
