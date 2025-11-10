import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS middleware (only once)
app.use(cors({ origin: "http://localhost:5173" }));

// Parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  channel: String,
  thumbnail: String,
});

const Video = mongoose.model("Video", videoSchema);

// Routes
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    const videos = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    await Video.insertMany(videos, { ordered: false }).catch(() => null);
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
