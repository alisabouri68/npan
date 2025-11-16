const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// اتصال به MongoDB Atlas
connectDB();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const hybRoutes = require("./routes/hybRoutes");

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    "https://v00-04.vercel.app",
    "http://localhost:4000",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(morgan("combined"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/hyb", hybRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server is running!",
    version: "1.0.0",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "✅ OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, error: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
