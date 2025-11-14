const { users, nextId } = require('../data/users');

const userController = {
  // دریافت همه کاربران
  getAllUsers: (req, res) => {
    const { search, minAge, maxAge } = req.query;
    
    let filteredUsers = [...users];
    
    // فیلتر بر اساس جستجو
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.includes(search) || user.email.includes(search)
      );
    }
    
    // فیلتر بر اساس حداقل سن
    if (minAge) {
      filteredUsers = filteredUsers.filter(user => user.age >= parseInt(minAge));
    }
    
    // فیلتر بر اساس حداکثر سن
    if (maxAge) {
      filteredUsers = filteredUsers.filter(user => user.age <= parseInt(maxAge));
    }
    
    res.json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers
    });
  },

  // دریافت کاربر بر اساس ID
  getUserById: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'کاربر مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  },

  // ایجاد کاربر جدید
  createUser: (req, res) => {
    const { name, email, age } = req.body;
    
    // چک کردن ایمیل تکراری
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'این ایمیل قبلاً ثبت شده است'
      });
    }
    
    const newUser = {
      id: nextId,
      name,
      email,
      age: age || null,
      createdAt: new Date()
    };
    
    users.push(newUser);
    nextId++;
    
    res.status(201).json({
      success: true,
      message: 'کاربر با موفقیت ایجاد شد',
      data: newUser
    });
  },

  // به‌روزرسانی کاربر
  updateUser: (req, res) => {
    const userId = req.userId;
    const { name, email, age } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'کاربر مورد نظر یافت نشد'
      });
    }
    
    // چک کردن ایمیل تکراری (به جز برای خود کاربر)
    const emailExists = users.some(u => u.email === email && u.id !== userId);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'این ایمیل قبلاً توسط کاربر دیگری ثبت شده است'
      });
    }
    
    // به‌روزرسانی فیلدها
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (age !== undefined) users[userIndex].age = age;
    users[userIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
      data: users[userIndex]
    });
  },

  // حذف کاربر
  deleteUser: (req, res) => {
    const userId = req.userId;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'کاربر مورد نظر یافت نشد'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد',
      data: deletedUser
    });
  }
};

module.exports = userController;