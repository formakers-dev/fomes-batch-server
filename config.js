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
    }
};

module.exports = config[process.env.NODE_ENV];