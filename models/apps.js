const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appsSchema = new Schema({
    packageName: String,
});

module.exports = mongoose.model('apps', appsSchema);
