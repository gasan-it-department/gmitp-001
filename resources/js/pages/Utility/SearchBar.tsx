import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  onSearch: (value: string) => void;
  searchBarHint: string;
}

const SearchBar: React.FC<Props> = ({ onSearch, searchBarHint }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-md px-2 w-80">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchBarHint}
        className="flex-1 p-2 outline-none"
      />
      {query && (
        <button
          onClick={handleClear}
          className="p-1 hover:text-gray-600 text-gray-400"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
