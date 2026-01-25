import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Needed for SearchBar mock
import { bind } from 'leaflet';
import { Award, ExternalLink, FileText, Gavel, FileCheck, Banknote, Clock, Tag, DollarSign, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import BidFiles from './BidFiles';

// --- MOCK SEARCH BAR COMPONENT (No changes needed, already responsive) ---
interface SearchBarProps {
    onSearch: (value: string) => void;
    searchBarHint: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchBarHint }) => {
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <form onSubmit={handleSearch} className="flex flex-1 w-full">
            <div className="relative flex-1 min-w-[200px] flex items-center">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchBarHint}
                    className="flex-1 w-full p-2 pl-4 pr-20 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-red-400 dark:bg-neutral-900 dark:text-gray-100 transition-shadow"
                />

                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-14 top-1/2 -translate-y-1/2 p-1 hover:text-red-500 text-gray-400 z-10"
                        aria-label="Clear search"
                    >
                        <X size={18} />
                    </button>
                )}

                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md flex-shrink-0 rounded-lg"
                    aria-label="Submit search"
                >
                    <Search size={18} />
                </Button>
            </div>
        </form>
    );
};
// ------------------------------------


// --- FILE CONSTANTS ---
const FILE_TYPE_INVITATION = 'INVITATION';
const FILE_TYPE_BID_DOCUMENTS = 'BID_DOCUMENTS';
const FILE_TYPE_NOTICE_OF_AWARD = 'NOTICE_OF_AWARD';
const MAX_ITEMS_DISPLAY = 10;

// Mock Type Definition based on provided sample data
interface AwardFile {
    id: number;
    name: string;
    type: string;
    view_url: string;
    download_url: string;
}

interface AwardsFormData {
    id: string;
    title: string;
    status: 'OPEN' | 'EVALUATION' | 'AWARDED' | 'CLOSED';
    approved_budget: number;
    closing_date: string;
    category: string;
    reference_number: string;
    winning_bidder: string | null;
    contract_amount: number | null;
    files?: AwardFile[];
}

interface BidsAndAwardsProps {
    data: AwardsFormData[]
    metaData: any
}

// --- UTILITY FUNCTIONS ---

const formatCurrency = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return "N/A";
    }
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

const getBadgeVariant = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'default';
        case 'AWARDED':
            return 'secondary';
        case 'EVALUATION':
            return 'outline';
        case 'CLOSED':
            return 'destructive';
        default:
            return 'outline';
    }
};

/**
 * Finds the download URL for a specific file type.
 */
const findFileUrl = (files: AwardsFormData['files'], type: string): string | undefined => {
    if (!files || files.length === 0) return undefined;
    const file = files.find(f => f.type === type);
    return file ? file.download_url : undefined;
};

export function BidsAndAwards({ data, metaData }: BidsAndAwardsProps) {
    const [activeTab, setActiveTab] = useState('biddings');
    const [searchQuery, setSearchQuery] = useState('');
    const [bidFilesVisible, setBidFilesVisible] = useState({
        isOpen: false,
        files: [] as string[],
        projectName: ""
    });

    // Filter the raw data based on the active tab and search query
    const { filteredAndSlicedBids, fullFilteredCount } = useMemo(() => {
        let list = data;

        // 1. Filter by Tab (Bidding vs. Awarded)
        if (activeTab === 'biddings') {
            // Bidding items are OPEN and EVALUATION (exclude AWARDED and CLOSED)
            list = list.filter(bid => bid.status === 'OPEN' || bid.status === 'EVALUATION');
        } else {
            // Award items are AWARDED (exclude all others)
            list = list.filter(bid => bid.status === 'AWARDED');
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            list = list.filter(bid =>
                bid.title.toLowerCase().includes(lowerQuery) ||
                bid.reference_number.toLowerCase().includes(lowerQuery) ||
                bid.category.toLowerCase().includes(lowerQuery)
            );
        }

        const fullFilteredCount = list.length;
        const filteredAndSlicedBids = list.slice(0, MAX_ITEMS_DISPLAY);

        return { filteredAndSlicedBids, fullFilteredCount };
    }, [activeTab, data, searchQuery]);

    // Counts for tab navigation (based on all data, excluding CLOSED for active lists)
    const BiddingCount = data.filter(bid => bid.status === 'OPEN' || bid.status === 'EVALUATION').length;
    const AwardCount = data.filter(bid => bid.status === 'AWARDED').length;

    // --- THEME COLORS ---
    const primaryGradient = 'bg-gradient-to-r from-red-500 to-orange-500';
    const primaryText = 'text-red-700 dark:text-orange-200';
    const primaryBgHover = 'hover:bg-red-50/50 dark:hover:bg-red-900/40';
    const activeTabClasses = `${primaryGradient} text-white shadow-md hover:from-red-600 hover:to-orange-600`;
    // --------------------

    const handleSearch = (keyword: string) => {
        setSearchQuery(keyword);
    }

    return (
        <Card className="rounded-2xl shadow-xl border-red-200/60 dark:border-red-900/40">
            <CardHeader className="border-b border-orange-200 dark:border-red-900">
                <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-red-800 dark:text-orange-100">
                    {/* Icon with gradient background */}
                    <div className={`p-2 rounded-xl ${primaryGradient} text-white shadow-md flex-shrink-0`}>
                        <Gavel className="h-6 w-6" />
                    </div>
                    Bids & Awards
                </CardTitle>
                <CardDescription className="text-sm text-orange-800/90 dark:text-orange-200/90">Latest procurement opportunities and awarded contracts for the municipality.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">

                {/* TAB NAVIGATION */}
                {/* Responsive: Buttons will shrink/grow to fit but maintain space-x-3 */}
                <div className="flex space-x-3 border-b border-gray-200 dark:border-neutral-700 pb-2">
                    <Button
                        variant={activeTab === 'biddings' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('biddings')}
                        className={`font-semibold transition-all duration-200 ${activeTab === 'biddings' ? activeTabClasses : primaryText + ' ' + primaryBgHover}`}
                    >
                        <Banknote className="h-4 w-4 mr-2" />
                        <span className="truncate">Biddings ({BiddingCount})</span>
                    </Button>
                    <Button
                        variant={activeTab === 'awards' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('awards')}
                        className={`font-semibold transition-all duration-200 ${activeTab === 'awards' ? activeTabClasses : primaryText + ' ' + primaryBgHover}`}
                    >
                        <Award className="h-4 w-4 mr-2" />
                        <span className="truncate">Awards ({AwardCount})</span>
                    </Button>
                </div>

                {/* SEARCH BAR */}
                <SearchBar
                    onSearch={handleSearch}
                    searchBarHint={`Search ${activeTab === 'biddings' ? 'active bids' : 'awarded projects'}...`}
                />

                {/* DISPLAY LIMIT MESSAGE */}
                {fullFilteredCount > MAX_ITEMS_DISPLAY && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Showing top {MAX_ITEMS_DISPLAY} results. Total matching items: {fullFilteredCount}.
                    </p>
                )}


                {/* FILTERED LIST CONTENT */}
                <div className="space-y-4">
                    {filteredAndSlicedBids.length > 0 ? (
                        filteredAndSlicedBids.map((bid, index) => {
                            // Find relevant document URLs
                            const invitationUrl = findFileUrl(bid.files, FILE_TYPE_INVITATION);
                            const bidDocumentsUrl = findFileUrl(bid.files, FILE_TYPE_BID_DOCUMENTS);
                            const noticeOfAwardUrl = findFileUrl(bid.files, FILE_TYPE_NOTICE_OF_AWARD);

                            // Determine status specific classes
                            const statusColorClass = bid.status === 'OPEN'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : bid.status === 'EVALUATION'
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : bid.status === 'AWARDED'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-400 text-white hover:bg-gray-500';

                            return (
                                <div
                                    key={bid.id}
                                    onClick={() => {
                                        console.log("Ref no.: " + bid.files);
                                        setBidFilesVisible(() => ({
                                            isOpen: true,
                                            files: bid.files ? bid.files.map(file => file.view_url) : [],
                                            projectName: bid.title
                                        }))
                                    }}
                                    className={`
                                        space-y-3 rounded-xl border border-red-200/60 dark:border-red-900/40 p-4 transition-all duration-300 cursor-pointer
                                        bg-gradient-to-br from-red-50/70 via-orange-50/70 to-amber-100/70
                                        dark:from-red-950/70 dark:via-orange-950/70 dark:to-amber-900/70
                                        hover:shadow-lg hover:border-red-400
                                    `}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                                        {/* Title and Details (Container) */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="mb-1 font-bold text-lg text-red-900 dark:text-orange-100 line-clamp-2 w-full">
                                                {bid.title}
                                            </h3>

                                            {/* Details Row - Use flex-wrap for horizontal stacking on wide screens, wrapping on small screens */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-orange-800/80 dark:text-orange-200/80">

                                                {/* Category */}
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Tag className="h-3 w-3 text-red-500" />
                                                    {bid.category}
                                                </span>

                                                {/* Budget/Contract Amount */}
                                                <span className="text-gray-400">•</span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <DollarSign className="h-3 w-3 text-red-500" />
                                                    {bid.status === 'AWARDED' ? 'Contract Amount' : 'Approved Budget'}: {formatCurrency(bid.approved_budget)}
                                                </span>

                                                {/* Deadline/Award Date */}
                                                <span className="text-gray-400">•</span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Clock className="h-3 w-3 text-red-500" />
                                                    {bid.status === 'AWARDED' ? 'Award Date' : 'Closing Date'}: {bid.closing_date ? new Date(bid.closing_date).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>

                                            {/* Reference Number (Subtle) - Forced to new line for clarity */}
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block w-full">
                                                Ref No: {bid.reference_number || '—'}
                                            </span>

                                            {/* Winning Bidder (If awarded) - Forced to new line for clarity */}
                                            {bid.status === 'AWARDED' && bid.winning_bidder && (
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 block w-full">
                                                    Winning Bidder: {bid.winning_bidder}
                                                </span>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <Badge
                                            variant={getBadgeVariant(bid.status)}
                                            className={`font-bold text-sm h-7 flex items-center shadow-sm flex-shrink-0 ${statusColorClass}`}
                                        >
                                            {bid.status}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed rounded-lg bg-white dark:bg-neutral-800">
                            {activeTab === 'biddings' ? 'No active procurement bids at this time.' : 'No recent awards issued.'}
                        </div>
                    )}

                    <BidFiles
                        isOpen={bidFilesVisible.isOpen}
                        files={bidFilesVisible.files}
                        projectName={bidFilesVisible.projectName}
                        onClose={() => {
                            setBidFilesVisible({ isOpen: false, files: [], projectName: "" });
                        }} />
                </div>
            </CardContent>
        </Card>
    );
}