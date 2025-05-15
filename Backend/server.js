require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const userRoutes = require("./routes/userRoutes");
const  { unlockNotifier }  = require("./services/unlockService")

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:8080",   
  "https://echoverse-share.vercel.app" 
];


// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true, 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

//Connect to DB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/user", userRoutes);

unlockNotifier();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
