import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#222", color: "#fff" }}>
      <Link to="/" style={{ marginRight: "1rem", color: "#fff" }}>Home</Link>
      <Link to="/search" style={{ marginRight: "1rem", color: "#fff" }}>Search</Link>
      <Link to="/trending" style={{ color: "#fff" }}>Trending</Link>
    </nav>
  );
}
