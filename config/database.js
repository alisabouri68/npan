const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // از متغیر محیطی استفاده کنید یا مستقیماً قرار دهید
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://raad-health-admin:password@cluster0.xxxxx.mongodb.net/raadHealth?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // تنظیمات جدیدتر برای جلوگیری از خطا
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Connected!`);
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Please check:');
    console.log('   - MongoDB Atlas Connection String');
    console.log('   - Network Access (IP Whitelist)');
    console.log('   - Database User Credentials');
    process.exit(1);
  }
};

// Event listeners برای دیباگ
mongoose.connection.on('connected', () => {
  console.log('🎯 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📦 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
