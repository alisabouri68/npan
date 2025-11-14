const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - User registration
router.post('/register', authController.register);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// GET /api/auth/verify-email - Email verification
router.get('/verify-email', authController.verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', authController.resendVerificationEmail);

// GET /api/auth/users - Get all users
router.get('/users', authController.getUsers);

// GET /api/auth/status - Database status
router.get('/status', authController.getStatus);

// NEW: GET /api/auth/profile - Get user profile
router.get('/profile', authController.getProfile);

// NEW: GET /api/auth/hyb - Get HYB data
router.get('/hyb', authController.getHyb);

module.exports = router;