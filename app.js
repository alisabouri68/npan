const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ اتصال به MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://alisabouri6857_db_user:EFASN5oRmegukgRo@cluster0.w6lfdrn.mongodb.net/raadHealth?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.log("❌ MongoDB connection error:", err.message));

// ✅ CORS Middleware - کامل و مطمئن
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://v00-04.vercel.app",
    "https://v0004.liara.run",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  
  const origin = req.headers.origin;
  
  console.log(`🌐 Request from: ${origin}`);
  console.log(`🔧 Method: ${req.method}`);
  console.log(`🛣️ Path: ${req.path}`);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log(`✅ Allowed CORS for: ${origin}`);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log(`✅ Handling OPTIONS preflight`);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// ✅ مدل User برای ذخیره‌سازی در دیتابیس
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ✅ Route ثبت‌نام که در دیتابیس ذخیره می‌کند
app.post("/api/auth/register", async (req, res) => {
  console.log("📨 Register request received:", req.body);
  
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // اعتبارسنجی
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }

    // بررسی آیا کاربر از قبل وجود دارد
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email"
      });
    }

    // ✅ ذخیره کاربر در دیتابیس MongoDB
    const user = new User({
      firstName,
      lastName,
      email,
      password, // در حالت واقعی باید hash شود
    });

    await user.save();
    console.log("💾 User saved to database:", user._id);

    // پاسخ موفق
    res.json({
      success: true,
      message: "User registered successfully! 🎉",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      token: "jwt-token-" + Date.now(),
      database: "MongoDB Atlas",
      saved: true
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed: " + error.message
    });
  }
});

// ✅ Route تست دیتابیس
app.get("/api/db-test", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    res.json({
      success: true,
      message: "Database is working!",
      usersCount: usersCount,
      database: "MongoDB Atlas"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database error: " + error.message
    });
  }
});

// ✅ Route سلامت
app.get("/health", (req, res) => {
  res.json({
    status: "✅ OK",
    service: "Raad Health API",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// ✅ Route اصلی
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Raad Health API Server is running!",
    version: "1.0.0",
    database: "MongoDB Atlas",
    register: "POST /api/auth/register",
    timestamp: new Date().toISOString()
  });
});

// ✅ Route مشاهده کاربران (برای تست)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ Handle OPTIONS برای همه routes
app.options("*", (req, res) => {
  res.status(200).end();
});

// ✅ Error handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found: " + req.method + " " + req.path
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 URL: https://v0004.liara.run`);
  console.log(`🗄️ Database: MongoDB Atlas`);
  console.log(`👤 Register: POST /api/auth/register`);
  console.log(`🔍 Test: GET /api/db-test`);
  console.log(`=================================`);
});
