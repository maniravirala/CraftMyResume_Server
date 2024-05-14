const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

router.post('/create', resumeController.createResume);
router.get('/view/:uniqueCode', resumeController.viewResume);

module.exports = router;