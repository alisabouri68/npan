// controllers/hybController.js
const Hyb = require('../models/Hyb');

const hybController = {
  getHyb: async (req, res) => {
    try {
      const userId = req.userId;
      const hyb = await Hyb.findOne({ userId });
      
      if (!hyb) {
        return res.status(404).json({
          success: false,
          error: 'HYB data not found'
        });
      }

      res.json({
        success: true,
        data: hyb
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error fetching HYB data'
      });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const userId = req.userId;
      const { settings } = req.body;

      const hyb = await Hyb.findOneAndUpdate(
        { userId },
        { $set: { settings } },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: hyb
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error updating settings'
      });
    }
  }
};

module.exports = hybController;