const Timeline = require("../models/timeline");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const { promisify } = require("util");
const fs = require("fs");
const unlinkAsync = promisify(fs.unlink);

// @desc Create new timeline memory
// @route POST /api/timeline
// @access Private

exports.createTimeline = async (req, res) => {
  try {
    const { title, mood, unlockAt } = req.body;

    // Audio file validation
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is not uploaded" });
    }

    try {
      // Upload audio file to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "echoverse",
      });
      if (!result || !result.secure_url) {
        return res.status(500).json({ message: "Error uploading audio file" });
      }
      // Create timeline entry in database
      const timelineData = {
        title: title || "",
        mood: mood || "",
        audioUrl: result.secure_url,
        unlockAt: unlockAt || null,
        user: req.user._id
      };
      
      const timeline = await Timeline.create(timelineData);
      
      // Delete the local file after successful upload
      await unlinkAsync(req.file.path);

      res.status(201).json({ data: timeline, success: true });
    } catch (error) {
      // If cloudinary upload fails, still remove the temporary file
      if (req.file && req.file.path) {
        await unlinkAsync(req.file.path).catch((err) =>
          console.error("Error deleting file:", err)
        );
      }
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size exceeds the 1MB limit" });
    }
    console.error(error);
    res.status(500).json({ message: "Server error while creating entries" });
  }
};

// @desc Get all timeline for the user
// @route GET /api/timelines
// @access Private
exports.getTimelines = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();

    let canView = true; // default: can view normally

    if (user.timeCapsuleMode?.enabled) {
      canView = now >= user.timeCapsuleMode.contentVisibleAfter;
    }

    const timelines = await Timeline.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const data = timelines.map((timeline) => {
      const unlocked = canView && new Date(timeline.unlockAt) <= now;

      return {
        _id: timeline._id,
        title: timeline.title,
        mood: timeline.mood,
        createdAt: timeline.createdAt,
        unlockAt: timeline.unlockAt,
        isUnlocked: unlocked,
        // audioUrl: unlocked ? timeline.audioUrl : null, // comment for testing/demo purpose
        audioUrl: timeline.audioUrl,
      };
    });

    res.status(200).json({
      data,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while getting entries" });
  }
};
