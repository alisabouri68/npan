const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://v00-04.vercel.app",
    "https://v0004.liara.run",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
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

// OPTIONS handler
app.options("*", (req, res) => {
  res.status(200).end();
});

// Basic routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Raad Health API Server is running!",
    version: "1.0.0",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", async (req, res) => {
  const mongoose = require('mongoose');
  
  res.json({
    status: "✅ OK",
    service: "Raad Health API",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database test route
app.get("/api/db-test", async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    
    res.json({
      success: true,
      message: "Database connection test",
      database: {
        connected: connectionState === 1,
        state: ['disconnected', 'connected', 'connecting', 'disconnecting'][connectionState],
        name: mongoose.connection.name,
        host: mongoose.connection.host
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

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
  console.log(`🚀 Raad Health Server Started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: https://v0004.liara.run`);
  console.log(`🗄️ Database: MongoDB Atlas`);
  console.log(`🔐 User: alisabouri6857_db_user`);
  console.log(`=================================`);
});
