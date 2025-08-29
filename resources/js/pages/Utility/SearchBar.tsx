import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSearch: (value: string) => void;
  searchBarHint: string
}

const SearchBar: React.FC<Props> = ({ onSearch, searchBarHint }) => {
  const [query, setQuery] = useState("");

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-md px-2 w-80">
      <input
        type="text"
        value={query}
        onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
        }}
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
