const express = require('express');
const userController = require('../controllers/userController');
const pdf = require('../controllers/pdfGeneration');


const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login); 
router.post('/generate', pdf.generatePdf);

module.exports = router;