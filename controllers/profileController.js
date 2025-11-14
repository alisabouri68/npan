// controllers/profileController.js
const Profile = require('../models/Profile');

const profileController = {
  getProfile: async (req, res) => {
    try {
      const userId = req.userId; // از middleware می‌آید
      const profile = await Profile.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error fetching profile'
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.userId;
      const updates = req.body;

      const profile = await Profile.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error updating profile'
      });
    }
  }
};

module.exports = profileController;