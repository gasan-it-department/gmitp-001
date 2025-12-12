import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSearch: (value: string) => void;
  searchBarHint: string;
}

const SearchBar: React.FC<Props> = ({ onSearch, searchBarHint }) => {
  // State to hold the current input value
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch(""); // Clear the search results immediately
  };

  return (
    // Removed outer space-x-2, made form flex-1 to occupy available space
    <form onSubmit={handleSearch} className="flex flex-1 w-full">
      <div className="relative flex-1 min-w-[200px] flex items-center">
        {/* Search Input Container */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchBarHint}
          // Increased right padding (pr-20) to ensure space for both X and Search buttons
          className="flex-1 w-full p-2 pl-4 pr-20 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-red-400 dark:bg-neutral-900 dark:text-gray-100 transition-shadow"
        />

        {/* Clear Button (inside the input field, positioned left of the Search Button) */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            // Positioned left of the Search Button (Search button is 36px wide + 4px margin)
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 hover:text-red-500 text-gray-400 z-10"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}

        {/* Search Button (Moved inside and positioned on the far right) */}
        <Button
          type="submit"
          size="icon"
          // Fixed size h-9 w-9, positioned on the far right
          className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md flex-shrink-0 rounded-lg"
          aria-label="Submit search"
        >
          <Search size={18} />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;