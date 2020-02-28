const shell = require('shelljs');
const config = require('../config');
const log = require('../utils/log');
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

    const response = shell.exec(`mongo "${config.fomesDbUrl}" --eval "db.getCollection('short-term-stats').renameCollection('backup-short-term-stats')"`);

    checkResponse(response);

    const regex = /[^{]*{[^}]*"?ok"?\s?:\s?([^\s]),?[^}]*}.*/;
    const matchedGroups = response.stdout.match(regex);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] === 0) {
        log.info(TAG, '[error] 컬렉션명 변경에 실패했습니다. (backup-short-term-stats가 이미 존재하거나 응답 포맷이 변경되었을 수 있습니다.)');
    }
};

const downloadCommand = (downloadFilePath) => {
    log.info(TAG, '2. export backup-short-term-stats collection');

    const response = shell.exec(`mongoexport --uri "${config.fomesDbUrl}" --collection "backup-short-term-stats" --type "json" --out "${downloadFilePath}"`);

    checkResponse(response);

};
const dropCommand = () => {
    log.info(TAG, '3. drop backup-short-term-stats');

    const response = shell.exec(`mongo "${config.fomesDbUrl}" --eval "db.getCollection('backup-short-term-stats').drop()"`);

    checkResponse(response);

    const regex = /.*(true).*/;
    const matchedGroups = response.stdout.match(regex);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] !== 'true') {
        log.info(TAG, '[error] 삭제에 실패했습니다. (backup-short-term-stats이 존재하지 않거나 응답 포맷이 변경되었을 수 있습니다.)');
        log.info(TAG, 'Matched Groups:', matchedGroups);
    }
};

const checkResponse = (response) => {
    log.info(TAG, '[shell.stdout]', response.stdout);

    if (response.code !== 0) {
        log.info(TAG, '[error] previous command occur a error. so, this job is going to finish');
        log.error(TAG, '[shell.stderr]', response.stderr);

        // TODO : 논의필요. 배치는 무정지 서버로 유지해야하지 않을지?
        shell.exit(1);
    }
};

const moveToAwsS3 = (downloadFilePath) => {
    log.info(TAG, '4. compress and move to aws s3');
    log.info(TAG, '4.1 compress');
    const gzFilePath = downloadFilePath + '.gz';
    const compressResponse = shell.exec('gzip ' + downloadFilePath);

    if(compressResponse.code === 0) {
        log.info(TAG, '4.2 move to aws s3');
        shell.exec('aws s3 mv ' + gzFilePath + ' s3://fomes-short-term-stats');
    }
};

module.exports = {backup, renameCommand, downloadCommand, dropCommand};
