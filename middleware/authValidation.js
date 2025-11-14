const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const errors = [];

  // اعتبارسنجی نام
  if (!firstName || firstName.trim().length < 2) {
    errors.push('نام باید حداقل ۲ کاراکتر باشد');
  }

  // اعتبارسنجی نام خانوادگی
  if (!lastName || lastName.trim().length < 2) {
    errors.push('نام خانوادگی باید حداقل ۲ کاراکتر باشد');
  }

  // اعتبارسنجی ایمیل
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('فرمت ایمیل نامعتبر است');
  }

  // اعتبارسنجی رمز عبور
  if (!password || password.length < 6) {
    errors.push('رمز عبور باید حداقل ۶ کاراکتر باشد');
  }

  // اعتبارسنجی تأیید رمز عبور
  if (password !== confirmPassword) {
    errors.push('رمز عبور و تأیید رمز عبور مطابقت ندارند');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }

  next();
};

module.exports = { validateRegistration };