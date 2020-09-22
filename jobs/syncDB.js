const shell = require('shelljs');
const config = require('../config');
const log = require('../utils/log');
const BetaTests = require('../models/betaTests');

const TAG = 'syncDB';

const syncDataToStg = (collectionName) => {
    log.info(TAG, `Start syncing "${collectionName}" to Stg`);

    const exportFilePath = `/tmp/${collectionName}.json`;
    const tempCollectionName = `temp-${collectionName}`;

    exportCollectionFromPrd(collectionName, exportFilePath);
    importCollectionToStg(tempCollectionName, exportFilePath);
    dropCollection(collectionName);
    renameCollection(tempCollectionName, collectionName);
};

const syncAppsDataToStg = () => {
    return BetaTests.aggregate([
            {$unwind: "$missions"},
            {$unwind: "$missions.items"},
            {$replaceRoot: {newRoot: "$missions.items"}},
            {$match: {packageName: {$exists: true}}},
            {$group: {"_id": null, "packageNames": {$addToSet: "$packageName"}}},
        ])
        .then(result => {
            const packageNamesForQuery = `"${result[0].packageNames.join('","')}"`;
            const query = `{"packageName":{"$in":[${packageNamesForQuery}]}}`;

            const collectionName = 'apps';
            const exportFilePath = `/tmp/${collectionName}.json`;
            const tempCollectionName = `temp-${collectionName}`;

            exportCollectionFromPrd(collectionName, exportFilePath, query);
            importCollectionToStg(tempCollectionName, exportFilePath);
            dropCollection(collectionName);
            renameCollection(tempCollectionName, collectionName);
        });
};

const exportCollectionFromPrd = (collectionName, exportFilePath, query) => {
    log.info(TAG, `1. Export "${collectionName}" from Prd`);

    const queryOption = query != null ? `--query='${query}'` : '';
    console.log(queryOption);
    const response = shell.exec(`mongoexport --collection='${collectionName}' --out='${exportFilePath}' --type='json' ${queryOption} --uri='${config.fomesDbUrl}'`);

    checkResponse(response);
};

const importCollectionToStg = (collectionName, importFilePath) => {
    log.info(TAG, `2. Import to Stg as "${collectionName}"`);

    const response = shell.exec(`mongoimport --collection="${collectionName}" --type="json" --uri="${config.fomesStgDbUrl}" --drop "${importFilePath}"; rm "${importFilePath}"`);

    checkResponse(response);
};

const dropCollection = (collectionName) => {
    log.info(TAG, `3. Drop old "${collectionName}" in Stg`);

    const response = shell.exec(`mongo --eval="db.getCollection(\\"${collectionName}\\").drop()" "${config.fomesStgDbUrl}"`);

    checkResponse(response);
};

const renameCollection = (from, to) => {
    log.info(TAG, `4. Rename "${from}" to "${to}"`);

    const response = shell.exec(`mongo --eval="db.getCollection(\\"${from}\\").renameCollection(\\"${to}\\");" "${config.fomesStgDbUrl}"`);

    checkResponse(response);
};

const checkResponse = (response) => {
    log.info(TAG, '[shell.stdout]', response.stdout);

    if (response.code !== 0) {
        log.info(TAG, '[error] previous command occur a error. so, this job is going to finish');
        log.error(TAG, '[shell.stderr]', response.stderr);

        slack.sendMessage('🚨 [배치] PRD -> STG DB Sync 작업 시 오류 발생!\n배치가 주것슴다--; 개발팀 출동하라! 🏃‍♀🏃‍♂️️', 'dev-issues');
        shell.exit(1);
    }
};

module.exports = {syncDataToStg, syncAppsDataToStg};