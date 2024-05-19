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
    viewedBy: [
        {
          name: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    downloads: { type: Number, default: 0 },
    downloadedBy: [{ type: String }],
    feedback: [
        {
          name: String,
          feedback: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;