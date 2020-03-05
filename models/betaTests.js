const mongoose = require('mongoose');
const connection = require('../db').FOMES;
const Schema = mongoose.Schema;

const betaTestSchema = new Schema({
    title: String,
    missions: Array,
});

module.exports = connection.model('beta-tests', betaTestSchema);
