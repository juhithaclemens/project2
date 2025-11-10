import { useEffect, useState } from "react";
import axios from "axios";
import VideoList from "../components/VideoList";

export default function Trending() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/videos");
        setVideos(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Trending Videos 🔥</h1>
      <VideoList videos={videos} />
    </div>
  );
}
