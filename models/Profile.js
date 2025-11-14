// models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  displayName: String,
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  social: {
    twitter: String,
    github: String,
    website: String
  },
  preferences: {
    theme: { type: String, default: 'system' },
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);