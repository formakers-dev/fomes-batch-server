const config = {
    development: {
        agendaDBUrl: process.env.AGENDA_MONGO_URL,
        dbUrl: process.env.MONGO_URL,
        firebaseMessaging: {
            serverKey: process.env.SERVER_KEY
        },
    },
    test: {
        agendaDBUrl: process.env.AGENDA_MONGO_URL,
        dbUrl: process.env.MONGO_URL,
        firebaseMessaging: {
            serverKey: 'testServerKey'
        },
    }
};

module.exports = config[process.env.NODE_ENV];