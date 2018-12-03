const shell = require('shelljs');
const config = require('../config');

const tag = '[backupShortTermStats]';

const backup = (downloadFilePath) => {
    renameCommand();
    downloadCommand(downloadFilePath);
    dropCommand();
    moveToAwsS3(downloadFilePath);
    console.log(tag, '============ backup done ============');
};

const renameCommand = () => {
    console.log(tag, '================ 1. rename from short-term-stats to backup-short-term-stats');

    const response = shell.exec(`mongo "${config.dbUrl}" --eval "db.getCollection('short-term-stats').renameCollection('backup-short-term-stats')"`);

    checkResponse(response);

    const regex = /[^{]*{[^}]*"?ok"?\s?:\s?([^\s]),?[^}]*}.*/;
    const matchedGroups = response.stdout.match(regex);
    console.log(tag, matchedGroups);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] === 0) {
        console.log(tag, '[error] 컬렉션명 변경에 실패했습니다. (backup-short-term-stats가 이미 존재하거나 응답 포맷이 변경되었을 수 있습니다.)');
    }
};

const downloadCommand = (downloadFilePath) => {
    console.log(tag, '================ 2. export backup-short-term-stats collection');

    const response = shell.exec(`mongoexport --uri "${config.dbUrl}" --collection "backup-short-term-stats" --type "json" --out "${downloadFilePath}"`);

    checkResponse(response);

};
const dropCommand = () => {
    console.log(tag, '================ 3. drop backup-short-term-stats');

    const response = shell.exec(`mongo "${config.dbUrl}" --eval "db.getCollection('backup-short-term-stats').drop()"`);

    checkResponse(response);

    const regex = /.*(true).*/;
    const matchedGroups = response.stdout.match(regex);
    console.log(tag, matchedGroups);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] !== 'true') {
        console.log(tag, '[error] 삭제에 실패했습니다. (backup-short-term-stats이 존재하지 않거나 응답 포맷이 변경되었을 수 있습니다.)');
    }
};

const checkResponse = (response) => {
    console.log(tag, response);

    if (response.code !== 0) {
        console.log(tag, '[error] previous command occur a error. so, this job is going to finish');
        console.error(response.stderr);

        // TODO : 논의필요. 배치는 무정지 서버로 유지해야하지 않을지?
        shell.exit(1);
    }
};

const moveToAwsS3 = (downloadFilePath) => {
    console.log(tag, '================ 4. compress and move to aws s3');
    console.log(tag, '================ 4.1 compress');
    const gzFilePath = downloadFilePath + '.gz';
    const compressResponse = shell.exec('gzip ' + downloadFilePath);

    if(compressResponse.code === 0) {
        console.log(tag, '================ 4.2 move to aws s3');
        shell.exec('aws s3 mv ' + gzFilePath + ' s3://short-term-stats');
    }
};

module.exports = {backup, renameCommand, downloadCommand, dropCommand};