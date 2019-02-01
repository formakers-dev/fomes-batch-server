const config = {};

config.development = {
    agendaDBUrl: process.env.AGENDA_MONGO_URL,
    dbUrl: process.env.MONGO_URL,
    firebaseMessaging: {
        serverKey: process.env.SERVER_KEY
    },
    backup: {
        host: process.env.BACKUP_HOST,
        port: '27017',
        username: process.env.BACKUP_USERNAME,
        password: process.env.BACKUP_PASSWORD,
        dbName: 'appbee',
        outputPath: process.env.BACKUP_OUTPUT_PATH ,
    },
    crawler: {
        rootDirPath: process.env.FOMES_CRAWLER_ROOT_DIR_PATH,
        logDirPath: process.env.FOMES_CRAWLER_LOG_DIR_PATH,
        uncrawledApp: {
            spiderName: process.env.FOMES_UNCRAWLED_APP_SPIDER_NAME,
        },
        app: {
            spiderName: process.env.FOMES_RANKED_APP_SPIDER_NAME,
            urls: process.env.FOEMS_RANKED_APP_SPIDER_URLS
        },
    }
};

config.staging = config.development;
config.production = config.development;

config.test = {
    agendaDBUrl: process.env.AGENDA_MONGO_URL,
    dbUrl: process.env.MONGO_URL,
    firebaseMessaging: {
        serverKey: 'testServerKey'
    },
    backup: {
        host: process.env.BACKUP_HOST,
        port: '27017',
        username: process.env.BACKUP_USERNAME,
        password: process.env.BACKUP_PASSWORD,
        dbName: 'test',
        outputPath: process.env.BACKUP_OUTPUT_PATH + 'test/',
    },
    crawler: {
        rootDirPath: '/test/crawler/root/dir/path/',
        logDirPath: '/test/crawler/log/dir/path/',
        uncrawledApp: {
            spiderName: 'TestUncrawledAppSpiderName',
        },
        rankedApp: {
            spiderName: 'TestRankedAppSpiderName',
            urls: 'test.ranking-urls.com'
        },
    }
};

module.exports = config[process.env.NODE_ENV];