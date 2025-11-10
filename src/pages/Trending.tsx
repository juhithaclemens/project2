import { useEffect, useState } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

type Video = {
  _id?: string;
  videoId?: string;
  title: string;
  channel: string;
  thumbnail?: string;
};

export default function Trending() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<Video[]>(`${BASE}/api/videos`)
      .then((res) => setVideos(res.data))
      .catch((err) => setError(err.message || "Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading trending videos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!videos || videos.length === 0)
    return (
      <div>
        <h1>Trending</h1>
        <p>No videos in database yet. Use the Search page to fetch and seed videos from YouTube.</p>
      </div>
    );

  return (
    <section>
      <h1>Trending</h1>
      <ul>
        {videos.map((v) => (
          <li key={v._id ?? v.videoId}>
            <img src={v.thumbnail} alt={v.title} style={{ width: 160 }} />
            <div>
              <strong>{v.title}</strong>
              <div>{v.channel}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}