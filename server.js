import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
// Use a port unlikely to be claimed by macOS system services
const PORT = process.env.PORT || 5001;

// Standard CORS middleware
app.use(cors());

// Universal middleware: log and ensure explicit CORS headers on every response
app.use((req, res, next) => {
  console.log(`[SERVER] ${new Date().toISOString()} - ${req.method} ${req.path} - Origin:`, req.headers.origin);
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON
app.use(express.json());

// Keep the server running even if Mongo connection fails; log status
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema + model
const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  channel: String,
  thumbnail: String,
});
const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

// Health route for quick testing
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// GET /api/videos — returns DB videos if connected, otherwise a demo array
app.get("/api/videos", async (req, res) => {
  console.log("[SERVER] /api/videos handler");
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("[SERVER] MongoDB not connected — returning demo videos");
      return res.json([
        {
          videoId: "demo1",
          title: "Demo Video 1",
          channel: "Demo Channel",
          thumbnail: "https://via.placeholder.com/160x90.png?text=Demo+1",
        },
      ]);
    }
    const videos = await Video.find().lean().exec();
    res.json(videos);
  } catch (err) {
    console.error("[SERVER] /api/videos error:", err);
    res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

// POST /api/videos/search — unchanged behavior, calls YouTube and seeds DB
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

// handle unhandled rejections/uncaught exceptions in dev: log them
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});