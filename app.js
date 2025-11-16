const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Connection String با پسورد واقعی
const MONGODB_URI = "mongodb+srv://alisabouri6857_db_user:پسورد_واقعی_شما@cluster0.w6lfdrn.mongodb.net/raadHealth?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection failed:", err.message));

// بقیه کدها...
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://v00-04.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
