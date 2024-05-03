const express = require('express');
const authController = require('../controllers/authController');
const pdf = require('../controllers/pdfGeneration');
const RateLimit = require('express-rate-limit');

const router = express.Router();

const LoginLimiter = RateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        error: 'Too many login attempts. Please try again in 5 minutes.'
    }
});

const RegisterLimiter = RateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        status: 429,
        error: 'Too many accounts created from this IP. Please try again after an hour.'
    }
});

router.post('/register', RegisterLimiter, authController.register);
router.post('/login', LoginLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/generate', pdf.generatePdf);
router.post('/sendPdf', pdf.sendPdf);

module.exports = router;