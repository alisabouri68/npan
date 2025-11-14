const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - دریافت همه کاربران
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت کاربران'
    });
  }
});

// GET /api/users/:id - دریافت کاربر بر اساس ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت کاربر'
    });
  }
});

// DELETE /api/users/:id - حذف کاربر
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'خطا در حذف کاربر'
    });
  }
});

module.exports = router;