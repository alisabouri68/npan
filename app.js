const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ✅ CORS Configuration - برای domain جدید
const corsOptions = {
  origin: [
    "https://v00-04.vercel.app",
    "https://v0004.liara.run",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization", 
    "Accept",
    "Origin",
    "X-Requested-With"
  ],
  optionsSuccessStatus: 200
};

// ✅ مهم: اول CROSD سپس بقیه middleware ها
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Handle preflight requests برای همه routes
app.options("*", cors(corsOptions));

// ✅ Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 API Server is running!",
    domain: "v0004.liara.run",
    timestamp: new Date().toISOString(),
    cors: "enabled"
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "✅ OK",
    service: "API Server",
    domain: "v0004.liara.run",
    timestamp: new Date().toISOString(),
    cors: {
      enabled: true,
      yourOrigin: req.headers.origin,
      allowedOrigins: [
        "https://v00-04.vercel.app",
        "https://v0004.liara.run"
      ]
    }
  });
});

// ✅ Register route
app.post("/api/auth/register", (req, res) => {
  console.log("📨 Register request:", {
    body: req.body,
    origin: req.headers.origin
  });
  
  res.json({
    success: true,
    message: "User registered successfully!",
    user: {
      id: "user-" + Date.now(),
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      createdAt: new Date().toISOString()
    },
    token: "jwt-token-" + Date.now()
  });
});

// ✅ Test CORS route
app.get("/api/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path
  });
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Domain: https://v0004.liara.run`);
  console.log(`🔗 Health: https://v0004.liara.run/health`);
  console.log(`🔒 CORS enabled for:`);
  console.log(`   - https://v00-04.vercel.app`);
  console.log(`   - https://v0004.liara.run`);
  console.log(`=================================`);
});
