const shell = require('shelljs');
const config = require('../config');

const backup = (downloadFilePath) => {
    renameCommand();
    downloadCommand(downloadFilePath);
    dropCommand();
    moveToAwsS3(downloadFilePath);
    console.log('============ backup done ============');
};

const renameCommand = () => {
    console.log('================ 1. rename from short-term-stats to backup-short-term-stats');
    const response = shell.exec('mongo --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --eval "db.getCollection(\'short-term-stats\').renameCollection(\'backup-short-term-stats\')"' +
        ' --ssl --sslAllowInvalidCertificates ' + config.backup.dbName);
    checkResponse(response);

    const regex = /[^{]*{[^}]*"?ok"?\s?:\s?([^\s]),?[^}]*}.*/;
    const matchedGroups = response.stdout.match(regex);
    console.log(matchedGroups);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] == 0) {
        console.log('[error] 컬렉션명 변경에 실패했습니다. (backup-short-term-stats가 이미 존재하거나 응답 포맷이 변경되었을 수 있습니다.)');
    }
};

const downloadCommand = (downloadFilePath) => {
    console.log('================ 2. mongoexport');
    const response = shell.exec('mongoexport --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --ssl --sslAllowInvalidCertificates --db=' + config.backup.dbName +
        ' --collection=backup-short-term-stats --type=json --out=' + downloadFilePath);
    checkResponse(response);
};

const dropCommand = () => {
    console.log('================ 3. drop backup-short-term-stats');
    const response = shell.exec('mongo --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --eval "db.getCollection(\'backup-short-term-stats\').drop()"' +
        ' --ssl --sslAllowInvalidCertificates ' + config.backup.dbName);

    checkResponse(response);

    const regex = /.*(true).*/;
    const matchedGroups = response.stdout.match(regex);
    console.log(matchedGroups);

    if (matchedGroups === null || matchedGroups === undefined || matchedGroups.length <= 1 || matchedGroups[1] !== 'true') {
        console.log('[error] 삭제에 실패했습니다. (backup-short-term-stats이 존재하지 않거나 응답 포맷이 변경되었을 수 있습니다.)');
    }
};

const checkResponse = (response) => {
    console.log(response);

    if (response.code !== 0) {
        console.log('[error] previous command occur a error. so, this job is going to finish');
        console.error(response.stderr);
        shell.exit(1);
    }
};

const moveToAwsS3 = (downloadFilePath) => {
    console.log('================ 4. compress and move to aws s3');
    console.log('================ 4.1 compress');
    const gzFilePath = downloadFilePath + '.gz';
    const compressResponse = shell.exec('gzip ' + downloadFilePath);

    if(compressResponse.code === 0) {
        console.log('================ 4.2 move to aws s3');
        shell.exec('aws s3 mv ' + gzFilePath + ' s3://short-term-stats');
    }
};

module.exports = {backup, renameCommand, downloadCommand, dropCommand};