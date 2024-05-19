const Resume = require('../models/resumeModel');
const User = require('../models/userModel');
const createError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

exports.getResumeDetails = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ uniqueCode: req.params.uniqueCode });
        if (!resume) {
            return next(new createError(404, 'Resume not found'));
        }

        const userIdentifier = req.cookies.access_token ? jwt.verify(req.cookies.access_token, process.env.JWT_SECRET)._id : null;

        if (!userIdentifier) {
            return next(new createError(401, 'Unauthorized'));
        }

        const resumeData = {
            name: resume.name,
            // details: resume.details,
            uniqueCode: resume.uniqueCode,
            views: resume.views,
            uniqueViews: resume.uniqueViews,
            downloads: resume.downloads,
            viewedBy: resume.viewedBy.map(viewer => ({ name: viewer.name, date: viewer.date })),
            feedback: resume.feedback,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
        };

        res.status(200).json({
            status: 'success',
            data: {
                resume: resumeData,
            },
        });

    } catch (error) {
        return next(new createError(400, error.message));
    }
};

exports.downloadResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ uniqueCode: req.params.uniqueCode });

        if (!resume) {
            return next(new createError(404, 'Resume not found'));
        }

        const pdfUrl = resume.pdfPath;

        const user = await User.findOne({ email: resume.email });
        const userIdentifier = req.cookies.access_token ? jwt.verify(req.cookies.access_token, process.env.JWT_SECRET)._id : null;

        if (!userIdentifier) {
            return next(new createError(401, 'Unauthorized'));
        }

        if (userIdentifier !== user._id.toString()) {
            if (!resume.downloadedBy.includes(userIdentifier)) {
                resume.downloadedBy.push(userIdentifier);
            }
            resume.downloads += 1;
            await resume.save();
        }

        const response = await axios.get(pdfUrl, {
            responseType: 'arraybuffer',
        });

        const pdf = Buffer.from(response.data, 'binary');
        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${resume.uniqueCode}.pdf`);
        res.status(200).send(pdf);

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

        const user = await User.findOne({ email: resume.email });

        const userIdentifier = req.cookies.access_token ? jwt.verify(req.cookies.access_token, process.env.JWT_SECRET)._id : null;

        if (!userIdentifier) {
            return next(new createError(401, 'Unauthorized'));
        }

        const viewedByUser = await User.findById(userIdentifier);

        if (userIdentifier !== user._id.toString()) {

            if (!resume.viewedBy.some(viewer => viewer._id.toString() === userIdentifier)) {
                const newViewedBy = {
                    name: viewedByUser.name,
                    _id: userIdentifier,
                };

                resume.viewedBy.push(newViewedBy);
                resume.uniqueViews += 1;
            }
            resume.views += 1;
            await resume.save();
        }

        const pdfUrl = resume.pdfPath;
        const response = await axios.get(pdfUrl, {
            responseType: 'arraybuffer',
        });

        const pdf = Buffer.from(response.data, 'binary');
        res.contentType('application/pdf');
        res.status(200).send(pdf);

    } catch (error) {
        return next(new createError(400, error.message));
    }
};

exports.addFeedback = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ uniqueCode: req.params.uniqueCode });
        if (!resume) {
            return next(new createError(404, 'Resume not found'));
        }

        const userIdentifier = req.cookies.access_token ? jwt.verify(req.cookies.access_token, process.env.JWT_SECRET)._id : null;

        if (!userIdentifier) {
            return next(new createError(401, 'Unauthorized'));
        }

        const feedbackUser = await User.findById(userIdentifier);

        const feedbackBody = req.body.feedback;
        if (!feedbackBody) {
            return next(new createError(400, 'Feedback is required'));
        }

        const newFeedback = {
            feedback: JSON.stringify(feedbackBody),
            name: feedbackUser.name,
        };
        
        resume.feedback.push(newFeedback);
        await resume.save();

        res.status(200).json({
            status: 'success',
            message: 'Feedback submitted successfully',
        });

    } catch (error) {
        return next(new createError(400, error.message));
    }
};