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
    const command = shell.exec('mongo --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --eval "db.getCollection(\'short-term-stats\').renameCollection(\'backup-short-term-stats\')"' +
        ' --ssl --sslAllowInvalidCertificates ' + config.backup.dbName);
    checkCommand(command);
    const renameResponse = JSON.parse("{" + command.stdout.split('\n{')[1]);
    if (renameResponse.ok === 0) {
        console.error("[error] " + renameResponse.errmsg + ", code=" + renameResponse.code + ", codeName=" + renameResponse.codeName);
    }
};

const downloadCommand = (downloadFilePath) => {
    console.log('================ 2. mongoexport');
    const command = shell.exec('mongoexport --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --ssl --sslAllowInvalidCertificates --db=' + config.backup.dbName +
        ' --collection=backup-short-term-stats --type=json --out=' + downloadFilePath);
    checkCommand(command);

};

const dropCommand = () => {
    console.log('================ 3. drop backup-short-term-stats');
    const command = shell.exec('mongo --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --eval "db.getCollection(\'backup-short-term-stats\').drop()"' +
        ' --ssl --sslAllowInvalidCertificates ' + config.backup.dbName);

    checkCommand(command);
    const dropResponse = JSON.parse(command.stdout.split('\n')[3]);
    if (dropResponse !== true) {
        console.log('[error] backup-short-term-stats이 없거나 삭제에 실패했습니다.');
    }
};

const checkCommand = (command) => {
    if(command.code !== 0) {
        console.error(command.stderr);
        shell.exit(1);
    }
};

const moveToAwsS3 = (downloadFilePath) => {
    console.log('================ 4. compress and move to aws s3');
    console.log('================ 4.1 compress');
    const gzFilePath = downloadFilePath + '.tar.gz';
    const commandCompress = shell.exec('tar -czvf ' + gzFilePath + ' ' + downloadFilePath);

    if(commandCompress.code === 0) {
        console.log('================ 4.2 move to aws s3');
        const commandAws = shell.exec('aws s3 mv ' + gzFilePath + ' s3://short-term-stats');

        if(commandAws.code === 0) {
            console.log('================ 4.3 remove the downloaded file');
            shell.exec('rm ' + downloadFilePath);
        }
    }
};

module.exports = {backup, renameCommand, downloadCommand, dropCommand};