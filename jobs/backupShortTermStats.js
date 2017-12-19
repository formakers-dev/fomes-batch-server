const shell = require('shelljs');
const config = require('../config');

const backup = () => {
    // 1. rename from short-term-stats to backup-short-term-stats
    console.log('================ 1. rename from short-term-stats to backup-short-term-stats');
    const renameCommand = shell.exec('mongo --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --eval "db.getCollection(\'short-term-stats\').renameCollection(\'backup-short-term-stats\')"' +
        ' --ssl --sslAllowInvalidCertificates ' + config.backup.dbName);
    checkCommand(renameCommand);
    const renameResponse = JSON.parse("{" + renameCommand.stdout.split('\n{')[1]);
    if (renameResponse.ok === 0) {
        console.error("[error] " + renameResponse.errmsg + ", code=" + renameResponse.code + ", codeName=" + renameResponse.codeName);
        return;
    }

    // 2. backup-short-term-stats mongoexport
    console.log('================ 2. mongoexport');
    const date = new Date().toISOString();
    const path = config.backup.outputPath + 'backup-short-term-stats-'+date+'.json';
    const exportCommand = shell.exec('mongoexport --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --ssl --sslAllowInvalidCertificates --db=' + config.backup.dbName +
        ' --collection=backup-short-term-stats --type=json --out=' + path);
    checkCommand(exportCommand);

    // 3. backup-short-term-stats drop
    console.log('================ 3. drop backup-short-term-stats');
    const dropCommand = shell.exec('mongo --host=' + config.backup.host + ' --port=' + config.backup.port +
        ' -u ' + config.backup.username + ' -p ' + config.backup.password + ' --authenticationDatabase admin' +
        ' --eval "db.getCollection(\'backup-short-term-stats\').drop()"' +
        ' --ssl --sslAllowInvalidCertificates ' + config.backup.dbName);

    checkCommand(dropCommand);
    const dropResponse = JSON.parse(dropCommand.stdout.split('\n')[3]);
    if (dropResponse !== true) {
        console.log('[error] backup-short-term-stats이 없거나 삭제에 실패했습니다.');
        return;
    }
    console.log('=================================================');
};

const checkCommand = (command) => {
    if(command.code !== 0) {
        console.error(command.stderr);
        shell.exit(1);
        return;
    }
};

module.exports = {backup};