const shell = require('shelljs');
const config = require('../config');
const log = require('../utils/log');
const slack = require('../utils/slack');
const TAG = 'backupShortTermStats';

const backup = (downloadFilePath) => {
    renameCommand();
    downloadCommand(downloadFilePath);
    dropCommand();
    moveToAwsS3(downloadFilePath);
    log.info(TAG, '\e[1;32mbackup done!!!\e[0m');
};

const renameCommand = () => {
    log.info(TAG, '1. rename "short-term-stats" collection to "backup-short-term-stats"');
    log.error(TAG, '1. rename "short-term-stats" collection to "backup-short-term-stats"');

    const response = shell.exec(`mongo "${config.fomesDbUrl}" --eval "db.getCollection('short-term-stats').renameCollection('backup-short-term-stats')"`);

    checkResponse(response);

    const regex = /[^{]*{[^}]*"?ok"?\s?:\s?([^\s]),?[^}]*}.*/;
    const matchedGroups = response.stdout.match(regex);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] === 0) {
        log.info(TAG, '[error] 컬렉션명 변경에 실패했습니다. (backup-short-term-stats가 이미 존재하거나 응답 포맷이 변경되었을 수 있습니다.)');
        log.error(TAG, '[error] 컬렉션명 변경에 실패했습니다. (backup-short-term-stats가 이미 존재하거나 응답 포맷이 변경되었을 수 있습니다.)');
    }
};

const downloadCommand = (downloadFilePath) => {
    log.info(TAG, '2. export backup-short-term-stats collection');
    log.error(TAG, '2. export backup-short-term-stats collection');

    const response = shell.exec(`mongoexport --uri "${config.fomesDbUrl}" --collection "backup-short-term-stats" --type "json" --out "${downloadFilePath}"`);

    checkResponse(response);

};
const dropCommand = () => {
    log.info(TAG, '3. drop backup-short-term-stats');
    log.error(TAG, '3. drop backup-short-term-stats');

    const response = shell.exec(`mongo "${config.fomesDbUrl}" --eval "db.getCollection('backup-short-term-stats').drop()"`);

    checkResponse(response);

    const regex = /.*(true).*/;
    const matchedGroups = response.stdout.match(regex);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] !== 'true') {
        log.info(TAG, '[error] 삭제에 실패했습니다. (backup-short-term-stats이 존재하지 않거나 응답 포맷이 변경되었을 수 있습니다.)');
        log.error(TAG, '[error] 삭제에 실패했습니다. (backup-short-term-stats이 존재하지 않거나 응답 포맷이 변경되었을 수 있습니다.)');

        log.info(TAG, 'Matched Groups:', matchedGroups);
        log.error(TAG, 'Matched Groups:', matchedGroups);
    }
};

const checkResponse = (response) => {
    log.info(TAG, '[shell.stdout]', response.stdout);
    log.error(TAG, '[response]', response);

    if (response.code !== 0) {
        log.info(TAG, '[error] previous command occur a error. so, this job is going to finish');
        log.error(TAG, '[shell.stderr]', response.stderr);

        slack.sendMessage('🚨 [배치] 단기통계데이터 백업 시 오류 발생!\n배치가 주것슴다--; 개발팀 출동하라! 🏃‍♀🏃‍♂️️', 'dev-issues');
        shell.exit(1); // TODO: 리팩토링 시, 해당 로직등 트랜잭션으로 묶음 처리해서 배치는 무정지상태로 만들어야한다
    }
};

const moveToAwsS3 = (downloadFilePath) => {
    log.info(TAG, '4. compress and move to aws s3');
    log.error(TAG, '4. compress and move to aws s3');
    log.info(TAG, '4.1 compress');
    log.error(TAG, '4.1 compress');
    const gzFilePath = downloadFilePath + '.gz';
    const compressResponse = shell.exec('gzip ' + downloadFilePath);

    if (compressResponse.code === 0) {
        log.info(TAG, '4.2 move to aws s3');
        log.error(TAG, '4.2 move to aws s3');
        shell.exec('aws s3 mv ' + gzFilePath + ' s3://fomes-short-term-stats');
    }
};

module.exports = {backup, renameCommand, downloadCommand, dropCommand};
