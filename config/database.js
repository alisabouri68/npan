const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // اتصال بدون احراز هویت (پیشفرض)
    const conn = await mongoose.connect('mongodb://localhost:27017/raadHealth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// رویدادهای connection برای دیباگ
mongoose.connection.on('connected', () => {
  console.log('🎯 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

module.exports = connectDB;