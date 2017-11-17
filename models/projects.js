const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectId: Number,
    customerId: String,
    name: String,
    introduce: String,
    images: Array,
    description: String,
    descriptionImages: Array,
    interview: Array,
    status: String,
    interviewer: Object
});

module.exports = mongoose.model('projects', projectSchema);