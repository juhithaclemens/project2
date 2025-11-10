import { useState } from "react";
import axios from "axios";
import VideoList from "../components/VideoList";

export default function Search() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    try {
      const response = await axios.post("http://localhost:5000/api/videos/search", {
        query,
      });
      setVideos(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Search YouTube Videos 🔎</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
          Search
        </button>
      </form>

      <VideoList videos={videos} />
    </div>
  );
}
