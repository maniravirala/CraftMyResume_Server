const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var messageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var feedBackSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    details: {
        type: JSON,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const Message = mongoose.model('Message', messageSchema);
const FeedBack = mongoose.model('FeedBack', feedBackSchema);

module.exports = { Message, FeedBack };