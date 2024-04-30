const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');

router.post('/send-invitation', mailController.sendInvitation);

module.exports = router;