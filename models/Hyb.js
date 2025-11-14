// models/Hyb.js
const mongoose = require('mongoose');

const hybSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  settings: {
    ui: {
      sidebarCollapsed: { type: Boolean, default: false },
      compactMode: { type: Boolean, default: false },
      fontSize: { type: String, default: 'medium' }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      emailVisible: { type: Boolean, default: false },
      activityPublic: { type: Boolean, default: true }
    }
  },
  appState: {
    lastLogin: { type: Date, default: Date.now },
    sessionStart: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }
  },
  temporary: {
    draftPosts: [{
      title: String,
      content: String,
      lastSaved: Date
    }],
    recentSearches: [String],
    formData: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Hyb', hybSchema);