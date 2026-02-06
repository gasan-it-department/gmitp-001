import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Award, Banknote, Clock, Gavel, Search, Tag, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import BidFiles from './BidFiles';

// --- MOCK SEARCH BAR COMPONENT ---
interface SearchBarProps {
    onSearch: (value: string) => void;
    searchBarHint: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchBarHint }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSearch} className="flex w-full flex-1">
            <div className="relative flex min-w-[200px] flex-1 items-center">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchBarHint}
                    // Theme update: Standard border, background, and ring colors
                    className="w-full flex-1 rounded-lg border border-input bg-background p-2 pl-4 pr-20 transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                />

                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-14 top-1/2 z-10 -translate-y-1/2 p-1 text-muted-foreground hover:text-destructive"
                        aria-label="Clear search"
                    >
                        <X size={18} />
                    </button>
                )}

                <Button
                    type="submit"
                    size="icon"
                    // Theme update: Primary color
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 flex-shrink-0 rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
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
    data: AwardsFormData[];
    metaData: any;
}

// --- UTILITY FUNCTIONS ---

const formatCurrency = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const getBadgeVariant = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'default'; // Usually primary/black
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

const findFileUrl = (files: AwardsFormData['files'], type: string): string | undefined => {
    if (!files || files.length === 0) return undefined;
    const file = files.find((f) => f.type === type);
    return file ? file.download_url : undefined;
};

export function BidsAndAwards({ data, metaData }: BidsAndAwardsProps) {
    const [activeTab, setActiveTab] = useState('biddings');
    const [searchQuery, setSearchQuery] = useState('');
    const [bidFilesVisible, setBidFilesVisible] = useState({
        isOpen: false,
        files: [] as AwardFile[],
        projectName: '',
    });

    // Filter the raw data based on the active tab and search query
    const { filteredAndSlicedBids, fullFilteredCount } = useMemo(() => {
        let list = data;

        // 1. Filter by Tab (Bidding vs. Awarded)
        if (activeTab === 'biddings') {
            list = list.filter((bid) => bid.status === 'OPEN' || bid.status === 'EVALUATION');
        } else {
            list = list.filter((bid) => bid.status === 'AWARDED');
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            list = list.filter(
                (bid) =>
                    bid.title.toLowerCase().includes(lowerQuery) ||
                    bid.reference_number.toLowerCase().includes(lowerQuery) ||
                    bid.category.toLowerCase().includes(lowerQuery)
            );
        }

        const fullFilteredCount = list.length;
        const filteredAndSlicedBids = list.slice(0, MAX_ITEMS_DISPLAY);

        return { filteredAndSlicedBids, fullFilteredCount };
    }, [activeTab, data, searchQuery]);

    const BiddingCount = data.filter((bid) => bid.status === 'OPEN' || bid.status === 'EVALUATION').length;
    const AwardCount = data.filter((bid) => bid.status === 'AWARDED').length;

    const handleSearch = (keyword: string) => {
        setSearchQuery(keyword);
    };

    return (
        // Theme Update: 'bg-card' and 'border-border'
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-foreground">
                    {/* Icon: Primary background */}
                    <div className="flex-shrink-0 rounded-xl bg-primary p-2 text-primary-foreground shadow-md">
                        <Gavel className="h-6 w-6" />
                    </div>
                    Bids & Awards
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Latest procurement opportunities and awarded contracts for the municipality.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* TAB NAVIGATION */}
                <div className="flex space-x-3 border-b border-border pb-2">
                    <Button
                        variant={activeTab === 'biddings' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('biddings')}
                        // Theme Update: Active uses primary, Inactive uses ghost/muted
                        className={`font-semibold transition-all duration-200 ${
                            activeTab === 'biddings'
                                ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                    >
                        <Banknote className="mr-2 h-4 w-4" />
                        <span className="truncate">Biddings ({BiddingCount})</span>
                    </Button>
                    <Button
                        variant={activeTab === 'awards' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('awards')}
                        className={`font-semibold transition-all duration-200 ${
                            activeTab === 'awards'
                                ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                    >
                        <Award className="mr-2 h-4 w-4" />
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
                    <p className="text-xs text-muted-foreground">
                        Showing top {MAX_ITEMS_DISPLAY} results. Total matching items: {fullFilteredCount}.
                    </p>
                )}

                {/* FILTERED LIST CONTENT */}
                <div className="space-y-4">
                    {filteredAndSlicedBids.length > 0 ? (
                        filteredAndSlicedBids.map((bid) => {
                            // Determine status specific classes (Kept distinct colors for status clarity, but softened)
                            const statusColorClass =
                                bid.status === 'OPEN'
                                    ? 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                                    : bid.status === 'EVALUATION'
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
                                      : bid.status === 'AWARDED'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent';

                            return (
                                <div
                                    key={bid.id}
                                    onClick={() => {
                                        setBidFilesVisible(() => ({
                                            isOpen: true,
                                            files: bid.files || [],
                                            projectName: bid.title,
                                        }));
                                    }}
                                    // Theme Update: List items use card background and border
                                    className="cursor-pointer space-y-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        {/* Title and Details */}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="mb-1 w-full line-clamp-2 text-lg font-bold text-foreground">
                                                {bid.title}
                                            </h3>

                                            {/* Details Row */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                {/* Category */}
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Tag className="h-3 w-3 text-primary" />
                                                    {bid.category}
                                                </span>

                                                {/* Budget/Contract Amount */}
                                                <span className="text-border">•</span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    {bid.status === 'AWARDED' ? 'Contract Amount' : 'Approved Budget'}:{' '}
                                                    <span className="text-foreground">{formatCurrency(bid.approved_budget)}</span>
                                                </span>

                                                {/* Deadline/Award Date */}
                                                <span className="text-border">•</span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Clock className="h-3 w-3 text-primary" />
                                                    {bid.status === 'AWARDED' ? 'Award Date' : 'Closing Date'}:{' '}
                                                    {bid.closing_date ? new Date(bid.closing_date).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>

                                            {/* Reference Number */}
                                            <span className="mt-1 block w-full text-xs text-muted-foreground">
                                                Ref No: <span className="font-mono">{bid.reference_number || '—'}</span>
                                            </span>

                                            {/* Winning Bidder (If awarded) */}
                                            {bid.status === 'AWARDED' && bid.winning_bidder && (
                                                <span className="mt-1 block w-full text-sm font-semibold text-primary">
                                                    Winning Bidder: {bid.winning_bidder}
                                                </span>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <Badge
                                            variant={getBadgeVariant(bid.status)}
                                            className={`flex h-7 flex-shrink-0 items-center text-sm font-bold shadow-sm ${statusColorClass}`}
                                        >
                                            {bid.status}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/30 py-8 text-center text-muted-foreground">
                            {activeTab === 'biddings' ? 'No active procurement bids at this time.' : 'No recent awards issued.'}
                        </div>
                    )}

                    <BidFiles
                        isOpen={bidFilesVisible.isOpen}
                        files={bidFilesVisible.files}
                        projectName={bidFilesVisible.projectName}
                        onClose={() => {
                            setBidFilesVisible({ isOpen: false, files: [], projectName: '' });
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}