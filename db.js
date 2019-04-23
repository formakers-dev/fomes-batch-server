const mongoose = require('mongoose');
const config = require('./config');

const connectionMap = {};

const add = (connectionName, dbUrl) => {

    let connectionInfo = {
        url: dbUrl,
        connection: null
    };

    Object.defineProperty(connectionMap, connectionName, {
        configurable: false,
        get: () => {
            return getConnection(connectionInfo);
        },
        set: (x) => {}
    });
};

const getConnection = (connectionInfo) => {
    if (!connectionInfo.connection || connectionInfo.connection.readyState === 0) {
        connectionInfo.connection = mongoose.createConnection(connectionInfo.url, {useNewUrlParser: true});

        setRecoverConfig(connectionInfo);
    }

    return connectionInfo.connection;
};

const setRecoverConfig = (connectionInfo) => {
    const retryConnect = () => {
        getConnection(connectionInfo);
    };

    connectionInfo.connection.on('disconnected', retryConnect);
};

// 새 DB를 연결하고 싶다면, 아래에 add 함수로 호출하세요.
// call `add` function if you want to connect new db.
add('FOMES', config.fomesDbUrl);

module.exports = connectionMap;
