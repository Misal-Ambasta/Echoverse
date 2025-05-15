const express = require("express");
const router = express.Router();
const {
  createTimeline,
  getTimelines,
} = require("../controller/timelineController");
const { protect } = require("../middleware/protect");
const multer = require("multer");

// Setup multer for temporary uploads with file size limit (1MB = 1 * 1024 * 1024 bytes)
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB size limit
  },
});

// Routes
router.post("/", protect, upload.single("audio"), createTimeline);
router.get("/", protect, getTimelines);

module.exports = router;
