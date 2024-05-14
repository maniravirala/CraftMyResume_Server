const Resume = require('../models/resumeModel');
const User = require('../models/userModel');
const createError = require('../utils/appError');
const jwt = require('jsonwebtoken');

exports.createResume = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return next(new createError(404, 'User not found'));
        }

        const resume = new Resume({
            name: user.name,
            email: user.email,
            details: req.body.details,
            pdfPath: req.body.pdfPath,
            uniqueCode: `${user.name.split(' ')[0].toLowerCase()}-${Date.now()}`,
        });

        await resume.save();

        res.status(201).json({
            status: 'success',
            data: {
                resume,
            },
        });

    } catch (error) {
        return next(new createError(400, error.message));
    }
};

exports.viewResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ uniqueCode: req.params.uniqueCode });
        if (!resume) {
            return next(new createError(404, 'Resume not found'));
        }

        const userIdentifier = req.ip;
        if (!resume.viewedBy.includes(userIdentifier)) {
            resume.viewedBy.push(userIdentifier);
            resume.uniqueViews += 1;
        }
        resume.views += 1;
        await resume.save();

        res.status(200).json({
            status: 'success',
            data: {
                resume,
            },
        });

    } catch (error) {
        return next(new createError(400, error.message));
    }
};