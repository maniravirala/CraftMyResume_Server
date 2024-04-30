const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const createError = require('../utils/appError');
require('dotenv').config();

module.exports = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return next(new createError(401, 'Access Denied'));

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token expired
        if (user.exp < Date.now().valueOf() / 1000) {
            res.clearCookie('access_token', {
                secure: true,
                sameSite: 'None'
            });
            return next(new createError(403, 'Token expired'));
        }

        const isUser = await User.findById(user._id);
        if (!isUser) {
            res.clearCookie('access_token', {
                secure: true,
                sameSite: 'none'
            });
            return next(new createError(401, 'User not found'));
        }

        req.user = user;
        next();
    } catch (err) {
        res.clearCookie('access_token', {
            secure: true,
            sameSite: 'None'
        });
        return next(new createError(403, 'Invalid Token'));
    }
}
