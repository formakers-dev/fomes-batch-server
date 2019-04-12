const mongoose = require('mongoose');
const connection = require('../db').FOMES;
const Schema = mongoose.Schema;

const appsSchema = new Schema({
    packageName: String,
});

module.exports = connection.model('apps', appsSchema);
