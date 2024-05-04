const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { ProfilePicture } = require('../models/profileDataModel');
const createError = require('../utils/appError');

const router = express.Router();

router.get('/details', async (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return next(new createError(401, 'Unauthorized'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            return next(new createError(404, 'User not found'));
        }

        const code = user.code;
        const referredUsers = user.referredUsers;
        const newReferredUsers = [];

        for (const userId of referredUsers) {
            const referredUser = await User.findOne({ _id: userId });
            const profilePicture = await ProfilePicture.findOne({ user: userId });
            newReferredUsers.push({
                name: referredUser.name,
                email: referredUser.email,
                date: referredUser.created,
                pic: profilePicture ? profilePicture.profilePicture : null,
            });
        }

        res.status(200).json({
            code: code,
            referredUsers: newReferredUsers,
            credits: user.credits,
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        return next(new createError(500, err.message));
    }
});

module.exports = router;
