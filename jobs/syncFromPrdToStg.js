const shell = require('shelljs');
const config = require('../config');
const log = require('../utils/log');
const TAG = 'syncFromPrdToStg';

const syncFromPrdToStg = (collectionName) => {
    log.info(TAG, `Start syncing "${collectionName}" from Prd to Stg`);

    const exportFilePath = `/tmp/${collectionName}.json`;
    const tempCollectionName = `temp-${collectionName}`;

    exportCollectionFromPrd(collectionName, exportFilePath);
    importCollectionToStg(tempCollectionName, exportFilePath);
    dropCollection(collectionName);
    renameCollection(tempCollectionName, collectionName);
};

const exportCollectionFromPrd = (collectionName, exportFilePath) => {
    log.info(TAG, `1. Export "${collectionName}" from Prd`);

    const response = shell.exec(`mongoexport --collection="${collectionName}" --out="${exportFilePath}" --type="json" --uri="${config.fomesDbUrl}"`);

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

        // TODO : 논의필요. 배치는 무정지 서버로 유지해야하지 않을지?
        shell.exit(1);
    }
};

module.exports = syncFromPrdToStg;