const validateUser = (req, res, next) => {
  const { name, email, age } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'نام و ایمیل الزامی هستند'
    });
  }
  
  if (name.length < 2) {
    return res.status(400).json({
      error: 'نام باید حداقل ۲ کاراکتر باشد'
    });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({
      error: 'فرمت ایمیل نامعتبر است'
    });
  }
  
  if (age && (age < 0 || age > 150)) {
    return res.status(400).json({
      error: 'سن باید بین ۰ تا ۱۵۰ باشد'
    });
  }
  
  next();
};

const validateUserId = (req, res, next) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      error: 'آیدی کاربر نامعتبر است'
    });
  }
  
  req.userId = userId;
  next();
};

module.exports = { validateUser, validateUserId };