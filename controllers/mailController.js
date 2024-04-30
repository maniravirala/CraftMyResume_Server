const User = require('../models/userModel');
const createError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Send invitation to join Crafted Career
exports.sendInvitation = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = req.cookies.access_token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) return next(new createError(400, 'User not found'));

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Invitation to join Crafted Career',
            html:`
            <h2>Hello there!</h2>
            <p>You have been invited to join Crafted Career by your friend ${user.name}.</p>
            <p>Click <a href="${process.env.WEB_URL}/register?referralCode=${user.code}">here</a> to join Crafted Career</p>
            <p>Referal code: ${user.code}</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return next(new createError(400, error.message));
            }
            res.status(200).json({
                status: 'success',
                message: 'Invitation sent successfully'
            });
        }
        );
    }
    catch (error) {
        return next(new createError(400, error.message));
    }
}