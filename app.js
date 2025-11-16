const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['https://v00-04.vercel.app'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));

// Handle preflight requests
app.options("*", cors(corsOptions));

// ✅ Liara S3 Client با خطای درست
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

let s3Client;
try {
  s3Client = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
      accessKeyId: process.env.LIARA_ACCESS_KEY,
      secretAccessKey: process.env.LIARA_SECRET_KEY
    },
  });
  console.log('✅ Liara S3 Client initialized');
} catch (error) {
  console.log('⚠️ Liara S3 Client disabled:', error.message);
  s3Client = null;
}

// ✅ Route تست اتصال به Object Storage
app.get("/api/storage/test", async (req, res) => {
  if (!s3Client) {
    return res.status(500).json({
      success: false,
      error: "S3 client not configured"
    });
  }

  try {
    const params = {
      Bucket: process.env.LIARA_BUCKET_NAME, // ✅ درست شده - با براکت
      Key: "test.txt"
    };

    const data = await s3Client.send(new GetObjectCommand(params));
    const content = await data.Body.transformToString();
    
    res.json({
      success: true,
      message: "Connected to Liara Object Storage",
      content: content
    });
  } catch (error) {
    console.error('❌ Storage error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      note: "Make sure LIARA_ACCESS_KEY, LIARA_SECRET_KEY, and LIARA_BUCKET_NAME are set in environment variables"
    });
  }
});

// Import routes
const profileRoutes = require("./routes/profileRoutes");
const hybRoutes = require("./routes/hybRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/hyb", hybRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Raad Health API Server is running!",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    storage: s3Client ? "Connected" : "Disabled",
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "✅ OK",
    service: "Raad Health API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    storage: s3Client ? "Connected" : "Disabled",
    cors: {
      enabled: true,
      allowedOrigins: process.env.ALLOWED_ORIGINS
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found",
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS Error: Origin not allowed",
      allowedOrigins: process.env.ALLOWED_ORIGINS
    });
  }
  
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`✅ Raad Health Server Started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: https://raad-health.liara.run`);
  console.log(`💾 Storage: ${s3Client ? 'Connected' : 'Disabled'}`);
  console.log(`🔒 CORS: Enabled`);
  console.log(`=================================`);
});

module.exports = app;
