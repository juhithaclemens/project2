import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Trending from "./pages/Trending";
import Search from "./pages/Search";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/">Home</Link> | <Link to="/trending">Trending</Link> | <Link to="/search">Search</Link> | <Link to="/about">About</Link>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}