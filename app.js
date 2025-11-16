const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const app = express();
const PORT = process.env.PORT || 3000;
const profileRoutes = require("./routes/profileRoutes");
const hybRoutes = require("./routes/hybRoutes");
const corsOptions = {
  origin: ["https://v00-04.vercel.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};



// Connect to database
connectDB();

// Import routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/hyb", hybRoutes);
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server is running!",
    version: "1.0.0",
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

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "✅ OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 404 error handling
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Server error handling
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}`);
});
