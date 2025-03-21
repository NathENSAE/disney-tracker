import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, Film } from "lucide-react"; // Icons

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 bg-gray-900 text-white transition-[width] duration-300 ${
        isOpen ? "w-48" : "w-16"
      } h-auto max-h-screen overflow-y-auto`}
      style={{ overflowX: "hidden" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 w-full text-center bg-gray-800 hover:bg-gray-700 transition important-bg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav>
        <Link
          to="/"
          className="flex items-center p-3 hover:bg-gray-700 transition"
        >
          <Home size={24} />
          {isOpen && <span className="ml-3">Disney</span>}
        </Link>
        <Link
          to="/other"
          className="flex items-center p-3 hover:bg-gray-700 transition"
        >
          <Film size={24} />
          {isOpen && <span className="ml-3">Souvenirs</span>}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;