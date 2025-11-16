const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS Middleware - کامل و مطمئن
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://v00-04.vercel.app",
    "https://v0004.liara.run",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const hybRoutes = require("./routes/hybRoutes");

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/hyb", hybRoutes);

// ✅ OPTIONS handler for all routes
app.options("*", (req, res) => {
  res.status(200).end();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server is running!",
    version: "1.0.0",
    domain: "v0004.liara.run",
    timestamp: new Date().toISOString(),
    status: "CORS_ENABLED"
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "✅ OK",
    service: "Raad Health API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    domain: "v0004.liara.run",
    cors: "ENABLED"
  });
});

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
});

// Simple register test (بدون database)
app.post("/api/auth/register-simple", (req, res) => {
  console.log("📨 Register request:", req.body);
  
  res.json({
    success: true,
    message: "User registered successfully! 🎉",
    user: {
      id: "user-" + Date.now(),
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    },
    token: "test-token-" + Date.now()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Domain: https://v0004.liara.run`);
  console.log(`🔗 Health: https://v0004.liara.run/health`);
  console.log(`🔒 CORS enabled for v00-04.vercel.app`);
  console.log(`=================================`);
});
