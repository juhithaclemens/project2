import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  channel: String,
  thumbnail: String,
});
const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), dbState: mongoose.connection.readyState });
});

app.get('/api/videos', async (req, res) => {
  console.log('[SERVER] /api/videos handler - dbState=', mongoose.connection.readyState);
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const videos = await Video.find().lean().exec();
    res.json(videos);
  } catch (err) {
    console.error('[SERVER] /api/videos error:', err);
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/api/videos/search', async (req, res) => {
  const { query } = req.body;
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
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
        thumbnail: item.snippet.thumbnails?.medium?.url || '',
      }));

    await Video.insertMany(videos, { ordered: false }).catch(() => null);
    res.json(videos);
  } catch (err) {
    console.error('[SERVER] /api/videos/search error:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Connect to MongoDB, then start listening (no deprecated options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });