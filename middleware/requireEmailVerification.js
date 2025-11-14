const User = require('../models/User');

const requireEmailVerification = async (req, res, next) => {
  try {
    // گرفتن توکن از header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'دسترسی غیرمجاز. لطفاً وارد شوید.'
      });
    }

    // verify توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    // چک کردن تأیید ایمیل
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'لطفاً ابتدا ایمیل خود را تأیید کنید'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'توکن معتبر نیست'
    });
  }
};

module.exports = requireEmailVerification;