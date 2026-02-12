import { ChevronRight, Search, User, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { GovernmentApi } from '@/actions/App/External/Api/Controllers/Government'; // Enable this when ready

interface Props {
    onSelect: (official: Official) => void;
    onCreate: (name: string) => void; // Pass the typed name to the parent
}

export const SearchOfficial = ({ onSelect, onCreate }: Props) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<Official[]>([]); // Use real state

    // --- TEMPORARY MOCK DATA (Replace with GovernmentApi call later) ---
    const mockDatabase = [
        { id: '1', first_name: 'Juan', last_name: 'Dela Cruz', full_name: 'Juan Dela Cruz', municipality: 'Boac' },
        { id: '2', first_name: 'Maria', last_name: 'Santos', full_name: 'Maria Santos', municipality: 'Gasan' },
    ];

    // Simulating API Search
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        // In real app: const data = await GovernmentApi.searchOfficial(query);
        const filtered = mockDatabase.filter((p) => p.full_name.toLowerCase().includes(query.toLowerCase()));
        setResults(filtered as any);
    }, [query]);

    return (
        <div className="mx-auto w-full max-w-xl space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Official</label>

            <div className="group relative">
                {/* INPUT */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                    </div>

                    <input
                        type="text"
                        className="block w-full rounded-xl border border-gray-200 bg-white py-3 pr-10 pl-10 leading-5 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:text-sm"
                        placeholder="Search by name (e.g. Juan Cruz)..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />

                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                setIsOpen(false);
                            }}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                            <X className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* DROPDOWN */}
                {isOpen && query && (
                    <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl duration-200 animate-in fade-in zoom-in-95">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            {results.length > 0 ? 'Found Officials' : 'No Results Found'}
                        </div>

                        <ul className="max-h-60 overflow-y-auto">
                            {/* OPTION A: Select Existing */}
                            {results.map((person) => (
                                <li key={person.id}>
                                    <button
                                        type="button"
                                        className="group/item flex w-full items-center px-4 py-3 text-left transition-colors hover:bg-blue-50"
                                        onClick={() => {
                                            setQuery(person.full_name); // Set input to name
                                            setIsOpen(false); // Close dropdown
                                            onSelect(person); // TELL PARENT!
                                        }}
                                    >
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 font-bold text-blue-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 group-hover/item:text-blue-700">{person.full_name}</p>
                                            <p className="text-xs text-gray-500">{person.municipality}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover/item:text-blue-400" />
                                    </button>
                                </li>
                            ))}

                            {/* OPTION B: Create New */}
                            {results.length === 0 && (
                                <li className="p-2">
                                    <button
                                        type="button"
                                        className="group/create flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 py-4 text-gray-500 transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
                                        onClick={() => {
                                            setIsOpen(false);
                                            onCreate(query); // TELL PARENT to open dialog!
                                        }}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <UserPlus className="mb-1 h-6 w-6 text-gray-400 group-hover/create:text-blue-500" />
                                            <span className="text-sm font-medium">Create new official named "{query}"</span>
                                            <span className="text-xs text-gray-400">Click to add manually</span>
                                        </div>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
