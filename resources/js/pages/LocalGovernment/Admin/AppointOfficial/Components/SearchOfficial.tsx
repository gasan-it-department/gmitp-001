import { GovernmentApi } from '@/Core/Api/Government/government.api';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { ChevronRight, Loader2, Search, User, UserPlus, X } from 'lucide-react';
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
    const { currentMunicipality } = useMunicipality();
    //for loading effects while searching
    const [isLoading, setIsLoading] = useState(false);

    // Simulating API Search
    useEffect(() => {
        if (!query) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const delayDebounceFn = setTimeout(() => {
            const fetchOfficials = async () => {
                try {
                    const data = await GovernmentApi.SearhOfficial(query, currentMunicipality.slug);
                    console.log(data.data);

                    setResults(data);
                } catch (error) {
                } finally {
                    setIsLoading(false);
                }
            };

            fetchOfficials();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="mx-auto h-full w-full max-w-xl space-y-2">
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

                            {isLoading && (
                                <li className="flex justify-center p-6 text-blue-500">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </li>
                            )}

                            {!isLoading &&
                                results.map((person) => (
                                    <li key={person.id}>
                                        <button
                                            type="button"
                                            className="group/item flex w-full items-center px-4 py-3 text-left transition-colors hover:bg-blue-50"
                                            onClick={() => {
                                                setQuery(person.formatted_name); // Set input to name
                                                setIsOpen(false); // Close dropdown
                                                onSelect(person); // TELL PARENT!
                                            }}
                                        >
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 font-bold text-blue-600">
                                                {person.profile_url ? (
                                                    <img
                                                        src={person.profile_url}
                                                        alt={person.formatted_name}
                                                        className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                                                    />
                                                ) : (
                                                    <User className="h-5 w-5 text-blue-400" />
                                                )}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 group-hover/item:text-blue-700">
                                                    {person.formatted_name}
                                                </p>
                                                <p className="text-xs text-gray-500">{person.municipality}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover/item:text-blue-400" />
                                        </button>
                                    </li>
                                ))}

                            {/* OPTION B: Create New */}
                            {!isLoading && results.length === 0 && (
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
