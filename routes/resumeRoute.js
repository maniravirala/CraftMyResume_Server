const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

router.post('/create', resumeController.createResume);
router.get('/get/:uniqueCode', resumeController.getResumeDetails);
router.get('/download/:uniqueCode', resumeController.downloadResume);
router.get('/view/:uniqueCode', resumeController.viewResume);
router.post('/feedback/:uniqueCode', resumeController.addFeedback);

module.exports = router;