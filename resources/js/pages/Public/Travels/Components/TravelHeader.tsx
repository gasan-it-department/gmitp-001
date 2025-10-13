import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AdaptiveHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/70 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <nav className="flex space-x-6">
          <a
            href="/home"
            className={`${
              scrolled ? "text-gray-900 hover:text-blue-600" : "text-white hover:text-yellow-300"
            } text-base sm:text-lg font-medium transition-colors`}
          >
            Home
          </a>
          <a
            href="#emergency"
            className={`${
              scrolled ? "text-gray-900 hover:text-red-600" : "text-white hover:text-red-400"
            } text-base sm:text-lg font-medium transition-colors`}
          >
            Emergency
          </a>
          <a
            href="#popular_tour"
            className={`${
              scrolled ? "text-gray-900 hover:text-green-600" : "text-white hover:text-green-400"
            } text-base sm:text-lg font-medium transition-colors`}
          >
            Popular Tour
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
