// Put at top of file if not already present
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS + other middleware...
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.json());

// Schema + model
const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  channel: String,
  thumbnail: String,
});
const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), dbState: mongoose.connection.readyState });
});

// GET /api/videos — return DB results only (no demo fallback)
app.get("/api/videos", async (req, res) => {
  console.log("[SERVER] /api/videos handler - dbState=", mongoose.connection.readyState);
  try {
    if (mongoose.connection.readyState !== 1) {
      // DB not connected — return clear error (no demo)
      return res.status(503).json({ error: "Database not connected" });
    }
    const videos = await Video.find().lean().exec();
    res.json(videos);
  } catch (err) {
    console.error("[SERVER] /api/videos error:", err);
    res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

// POST /api/videos/search unchanged (calls YouTube and inserts into DB)
app.post("/api/videos/search", async (req, res) => {
  const { query } = req.body;
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        maxResults: 10,
        key: API_KEY,
      },
    });

    const videos = response.data.items
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
      }));

    await Video.insertMany(videos, { ordered: false }).catch(() => null);
    res.json(videos);
  } catch (err) {
    console.error("[SERVER] /api/videos/search error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Connect to MongoDB, then start listening
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    // Exit so the process doesn't silently serve demo data
    process.exit(1);
  });