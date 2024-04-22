const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const { getProfilePicture, updateProfilePicture, deleteProfilePicture } = require('../controllers/profileController');
const multer = require('../middleware/mutler');

// router.route('/').get(protect, getProfile).put(protect, updateProfile);
// router.post('/update', protect, updateProfile);
router.post('/update/:userId', multer.single('profilePicture'), updateProfilePicture);
router.get('/get/:userId', getProfilePicture);
router.delete('/delete/:userId', deleteProfilePicture);

module.exports = router;