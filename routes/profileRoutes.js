// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // همه routes نیاز به احراز هویت دارند

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;