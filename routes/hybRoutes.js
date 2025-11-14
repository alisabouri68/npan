// routes/hybRoutes.js
const express = require('express');
const router = express.Router();
const hybController = require('../controllers/hybController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // همه routes نیاز به احراز هویت دارند

router.get('/', hybController.getHyb);
router.put('/settings', hybController.updateSettings);

module.exports = router;