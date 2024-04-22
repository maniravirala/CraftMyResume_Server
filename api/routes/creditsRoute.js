const express = require('express');
const creditsController = require('../controllers/creditsController');

const router = express.Router();

router.post('/deduct', creditsController.deductCredit);
router.post('/add', creditsController.addCredit);

module.exports = router;