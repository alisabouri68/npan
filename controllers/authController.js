const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../services/emailService");
const mongoose = require("mongoose");
const Profile = require("../models/Profile"); 
const Hyb = require("../models/Hyb"); 

const authController = {
  register: async (req, res) => {
    console.log("📝 Registration request received:", req.body);

    try {
      const { firstName, lastName, email, password, confirmPassword } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        console.log("❌ Required fields are missing");
        return res.status(400).json({
          success: false,
          error: "All required fields must be filled",
        });
      }

      // Check password match
      if (password !== confirmPassword) {
        console.log("❌ Passwords do not match");
        return res.status(400).json({
          success: false,
          error: "Password and confirmation do not match",
        });
      }

      // Check password length
      if (password.length < 6) {
        console.log("❌ Password is too short");
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters",
        });
      }

      console.log("🔍 Checking for duplicate user...");

      // Check for existing user with this email
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existingUser) {
        console.log("❌ Duplicate user found");
        return res.status(409).json({
          success: false,
          error: "This email is already registered",
        });
      }

      console.log("🔐 Hashing password...");

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      console.log("👤 Creating new user...");

      // Create new user
      const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpires,
        isEmailVerified: false,
      });

      console.log("💾 Saving user to database...");

      const savedUser = await user.save();

      // Create profile automatically
      const profile = new Profile({
        userId: savedUser._id,
        displayName: `${savedUser.firstName} ${savedUser.lastName}`,
      });
      await profile.save();

      // Create HYB automatically
      const hyb = new Hyb({
        userId: savedUser._id,
        appState: {
          isVerified: false,
        },
      });
      await hyb.save();

      console.log("✅ User saved to MongoDB. ID:", savedUser._id);

      // Create JWT token
      const token = jwt.sign(
        { userId: savedUser._id },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "7d" }
      );

      // Send verification email
      let emailSent = false;
      try {
        emailSent = await sendVerificationEmail(
          savedUser.email,
          emailVerificationToken
        );
        console.log("✅ Verification email sent");
      } catch (emailError) {
        console.error("❌ Error sending email:", emailError);
      }

      // Create response without password
      const userResponse = {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        isEmailVerified: savedUser.isEmailVerified,
        createdAt: savedUser.createdAt,
      };

      console.log("📤 Sending success response...");

      res.status(201).json({
        success: true,
        message: emailSent
          ? "Registration successful! Please check your email for verification."
          : "Registration successful! But verification email failed to send.",
        data: userResponse,
        token: token,
        emailSent: emailSent,
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
      console.error("📄 Error details:", error.message);
      console.error("🔍 Error name:", error.name);

      // Duplicate key error (duplicate email)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: "This email is already registered",
        });
      }

      // Mongoose validation error
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          error: errors.join(", "),
        });
      }

      // General error
      res.status(500).json({
        success: false,
        error: "Server error during registration: " + error.message,
      });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;

      console.log("🔐 Received email verification request with token:", token);

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        console.log("❌ Verification token is invalid or expired");
        return res.status(400).json({
          success: false,
          error: "Verification link is invalid or expired",
        });
      }

      // Update user status
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      console.log("✅ User email verified:", user.email);

      // Create new JWT token
      const authToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "7d" }
      );

      // Create response with user data
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      };

      res.json({
        success: true,
        message: "Your email has been successfully verified!",
        token: authToken,
        user: userResponse,
      });
    } catch (error) {
      console.error("❌ Error in email verification:", error);
      res.status(500).json({
        success: false,
        error: "Error in email verification",
      });
    }
  },

  login: async (req, res) => {
    console.log("🔐 Login request received:", req.body);

    try {
      const { email, password } = req.body;

      // Validate fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      console.log("🔍 Finding user...");

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        console.log("❌ User not found");
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      console.log("🔐 Checking password...");

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("❌ Invalid password");
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Check email verification
      if (!user.isEmailVerified) {
        console.log("❌ User email not verified");
        return res.status(403).json({
          success: false,
          error: "Please verify your email first. A verification email has been sent to you.",
        });
      }

      console.log("✅ Login successful for user:", user.email);

      // Update HYB login data
      console.log("🔄 Updating HYB login data...");
      const hyb = await Hyb.findOne({ userId: user._id });
      if (hyb) {
        hyb.appState.lastLogin = new Date();
        hyb.appState.sessionStart = new Date();
        hyb.appState.loginCount += 1;
        hyb.appState.isVerified = user.isEmailVerified;
        await hyb.save();
        console.log("✅ HYB data updated");
      }

      // Create token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "7d" }
      );

      // Create response without password
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      };

      res.json({
        success: true,
        message: "Login successful!",
        data: userResponse,
        token: token,
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({
        success: false,
        error: "Server error during login",
      });
    }
  },

  // Get user profile endpoint
  getProfile: async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Authorization token required",
        });
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret-key"
      );
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Get profile data
      const profile = await Profile.findOne({ userId: user._id });

      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        displayName: profile?.displayName || `${user.firstName} ${user.lastName}`,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        profile: profile
      };

      res.json({
        success: true,
        data: userResponse,
      });
    } catch (error) {
      console.error("❌ Profile fetch error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: "Invalid token",
        });
      }

      res.status(500).json({
        success: false,
        error: "Error fetching profile",
      });
    }
  },

  // Get HYB data endpoint
  getHyb: async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Authorization token required",
        });
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret-key"
      );
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Get HYB data from database
      const hybData = await Hyb.findOne({ userId: user._id });

      if (!hybData) {
        return res.status(404).json({
          success: false,
          error: "HYB data not found",
        });
      }

      res.json({
        success: true,
        data: hybData,
      });
    } catch (error) {
      console.error("❌ HYB fetch error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: "Invalid token",
        });
      }

      res.status(500).json({
        success: false,
        error: "Error fetching HYB data",
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      console.log("📋 User list request received");

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: "Error fetching users",
      });
    }
  },

  getStatus: async (req, res) => {
    try {
      const dbState = mongoose.connection.readyState;
      const userCount = await User.countDocuments();

      res.json({
        success: true,
        database: {
          status: dbState === 1 ? "Connected" : "Disconnected",
          state: dbState,
          userCount: userCount,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Resend verification email endpoint
  resendVerificationEmail: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase().trim() });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User with this email not found",
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          error: "Your email is already verified",
        });
      }

      // Generate new token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = emailVerificationExpires;
      await user.save();

      // Send email
      const emailSent = await sendVerificationEmail(
        user.email,
        emailVerificationToken
      );

      res.json({
        success: true,
        message: emailSent
          ? "Verification email resent successfully"
          : "Failed to send verification email",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error resending verification email",
      });
    }
  },
};

module.exports = authController;