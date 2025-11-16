const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");

const app = express();

// پورت با مقدار پیش‌فرض
const PORT = process.env.PORT || 3000;

// Import routes
const profileRoutes = require("./routes/profileRoutes");
const hybRoutes = require("./routes/hybRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Allowed origins
const allowedOrigins = [
  "https://v00-04.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    console.log('🚫 CORS Blocked for origin:', origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
};

// ✅ ترتیب درست Middleware ها:

// 1. ابتدا CORS برای preflight requests
app.options("*", cors(corsOptions));

// 2. سپس middleware های اصلی
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));

// 3. اتصال به دیتابیس
connectDB();

// 4. routes ها
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/hyb", hybRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server is running!",
    version: "1.0.0",
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "User login",
        "GET /api/auth/verify-email": "Verify email",
        "GET /api/auth/profile": "Get user profile",
        "GET /api/auth/hyb": "Get HYB data",
        "GET /api/auth/users": "Get all users",
      },
      users: {
        "GET /api/users": "Get all users",
        "GET /api/users/:id": "Get user by ID",
        "POST /api/users": "Create new user",
        "PUT /api/users/:id": "Update user",
        "DELETE /api/users/:id": "Delete user",
      },
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "✅ OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      enabled: true
    }
  });
});

// Direct MongoDB debug route
app.get("/api/debug/users", async (req, res) => {
  try {
    const User = require("./models/User");
    const users = await User.find();
    console.log("🔍 All users in database:", users);
    res.json({ 
      success: true, 
      count: users.length, 
      data: users 
    });
  } catch (error) {
    console.error("❌ Debug route error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Error handler - بهبود یافته
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  
  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS Error: Origin not allowed",
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin
    });
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? "Internal server error" 
      : err.message
  });
});

// Start server - برای Liara مهم
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
  console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🚀 Ready to accept requests!`);
});

module.exports = app;
