const express = require('express');
const router = express.Router();

const { getMessages, sendMessage, getFeedBacks, sendFeedBack } = require('../controllers/messageController');

router.get('/get', getMessages);
router.post('/send', sendMessage);
router.get('/getFeedback', getFeedBacks);
router.post('/sendFeedback', sendFeedBack);

module.exports = router;