import { useState } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

type Video = {
  videoId?: string;
  title: string;
  channel: string;
  thumbnail?: string;
};

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<Video[]>(`${BASE}/api/videos/search`, { query: q });
      setResults(res.data);
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Search YouTube (via backend)</h1>
      <form onSubmit={handleSearch}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search query (e.g. react tutorial)" />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results && (
        <ul>
          {results.map((v) => (
            <li key={v.videoId}>
              <img src={v.thumbnail} alt={v.title} style={{ width: 160 }} />
              <div>
                <strong>{v.title}</strong>
                <div>{v.channel}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}