const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const config = require('./config');

const connect = () => {
    const connection = mongoose.connect(config.dbUrl, function(err) {
        if (err) {
            console.error('mongodb connection error', err);
        } else {
            console.log('mongodb connected');
        }
    });
    autoIncrement.initialize(connection);
};

const setRecoverConfig = () => {
    mongoose.connection.on('disconnected', connect);
};

const init = () => {
    connect();
    setRecoverConfig();
};

module.exports = {init};