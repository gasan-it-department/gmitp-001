import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { home } from "@/routes";

export default function AdaptiveHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentMunicipality } = useMunicipality();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: home.url({ municipality: currentMunicipality.slug }), color: "yellow" },
    // { label: "Emergency", href: "#emergency", color: "red" },
    // { label: "Popular Tour", href: "#popular_tour", color: "green" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/70 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img
            src="/assets/dummy/tourism.png"
            alt="Tourism Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md"
          />
          <span
            className={`text-xl sm:text-2xl font-bold tracking-wide ${scrolled ? "text-gray-900" : "text-white"
              }`}
          >
            Gasan<span className="text-orange-500">TOURISM</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`${scrolled
                ? "text-gray-900"
                : "text-white"
                } hover:text-${link.color}-500 text-base sm:text-lg font-medium transition-colors`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-gray-900" : "text-white"
            }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden bg-white/90 backdrop-blur-md shadow-lg rounded-b-2xl mx-4 overflow-hidden`}
          >
            <nav className="flex flex-col space-y-3 py-4 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-medium transition-all ${scrolled ? "text-gray-900" : "text-gray-800"
                    } hover:text-${link.color}-600`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
