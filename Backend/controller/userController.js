const User = require("../models/user");

exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeCapsuleMode } = req.body;
    
    // Validate the request body
    if (!timeCapsuleMode) {
      return res.status(400).json({
        success: false,
        message: "Time capsule mode settings are required"
      });
    }
    
    // Update user settings
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { timeCapsuleMode },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings"
    });
  }
}