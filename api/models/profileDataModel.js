const mongoose = require('mongoose');
const imagekit = require('../utils/imagekit');
const Schema = mongoose.Schema;

const profilePictureSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profilePicture: String,
    cloudinaryId: String,
    imagekitId: String
});

const ProfilePicture = mongoose.model('ProfilePicture', profilePictureSchema);

const profileDataSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    personalInfo: {
        name: String,
        email: String,
        phone: String,
        address: String,
        linkedin: String,
        github: String,
        position: String,
        summary: String
    },
    technicalSkills: [{
        domain: String,
        skills: [{
            id: Number,
            text: String
        }]
    }],
    certifications: [{
        title: String,
        issuedBy: String,
        date: String
    }],
    extraCurricularActivities: [{
        activity: String,
        date: String
    }],
    internships: [{}],
    summerTraining: [{
        title: String,
        organization: String,
        location: String,
        date: String,
        description: String
    }],
    projects: [{
        title: String,
        domain: String,
        technologies: String,
        date: String,
        description: String
    }],
    achievements: [{
        title: String,
        date: String,
        description: String
    }],
    education: [{
        institute: String,
        degree: String,
        location: String,
        date: String,
        score: String,
        scoreType: String
    }],
    visibility: {
        certifications: Boolean,
        extraCurricularActivities: Boolean,
        internships: Boolean,
        summerTraining: Boolean,
        projects: Boolean,
        achievements: Boolean
    },
    settings: {
        fontSize: Number,
        lineHeight: Number,
        pageMargins: Number,
        fontFamily: String,
        titleCase: String
    }
});

const ProfileData = mongoose.model('ProfileData', profileDataSchema);

module.exports = { ProfileData, ProfilePicture };