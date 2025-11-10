import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Trending from "./pages/Trending";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />
      </Routes>
    </>
  );
}

export default App;
