const express = require("express");
const router = express.Router();
const { updateSettings } = require("../controller/userController");
const { protect } = require("../middleware/protect");

// Routes
router.put("/settings", protect, updateSettings);

module.exports = router;