const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resumeSchema = new Schema({
    name: String,
    email: String,
    details: Schema.Types.Mixed,
    uniqueCode: { type: String, unique: true },
    pdfPath: String,
    uniqueViews: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    viewedBy: [{ type: String }] ,
    downloads: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;