const createError = require('../utils/appError');
const { Message, FeedBack } = require('../models/messageModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.sendMessage = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return next(new createError(400, 'Please fill all the fields'));
        }
        // store the message in the database
        const newMessage = new Message({
            name,
            email,
            message
        });
        await newMessage.save();
        res.status(200).json({
            status: 'success',
            message: 'Message sent successfully'
        });

    }
    catch (err) {
        return next(new createError(400, err.message));
    }
};

exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find();

        const newMessages = messages.map(message => {
            return {
                name: message.name,
                email: message.email,
                message: message.message,
                created: message.created
            };
        });

        res.status(200).json({
            status: 'success',
            messages: newMessages
        });
    }
    catch (err) {
        return next(new createError(400, err.message));
    }
}

exports.sendFeedBack = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return next(new createError(400, 'User not found'));
        }
        const { details } = req.body;
        if (!details) {
            return next(new createError(400, 'Please fill all the fields'));
        }

        const newFeedBack = new FeedBack({
            name: user.name,
            email: user.email,
            details
        });

        await newFeedBack.save();
        res.status(200).json({
            status: 'success',
            message: 'Feedback sent successfully'
        });
    }
    catch (err) {
        return next(new createError(400, err.message));
    }
}

exports.getFeedBacks = async (req, res, next) => {
    try {
        const feedBacks = await FeedBack.find();

        const newFeedBacks = feedBacks.map(feedBack => {
            return {
                name: feedBack.name,
                email: feedBack.email,
                details: feedBack.details,
                created: feedBack.created
            };
        });

        res.status(200).json({
            status: 'success',
            feedBacks: newFeedBacks
        });
    }
    catch (err) {
        return next(new createError(400, err.message));
    }
}
        
