import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, CheckCircle, XCircle, Tag, TrendingUp, Zap, Briefcase, Code } from "lucide-react";

// --- MOCK INTERFACES & DATA ---

interface Bid {
    id: string;
    projectTitle: string; // New: Title of the project/requirement
    budget: number; // New: Project budget
    category: string; // New: Project category
    amount: number; // The actual bid amount
    status: 'won' | 'lost' | 'pending';
    timeAgo: string;
}

const mockBids: Bid[] = [
    { id: 'BID-4987', projectTitle: 'New Municipal Website Development (UX/UI focus)', budget: 1800000.00, category: 'Technology', amount: 1550000.50, status: 'won', timeAgo: '2 hours ago' },
    { id: 'BID-4986', projectTitle: 'Public Park Lighting Upgrade & Solar Integration', budget: 1000000.00, category: 'Infrastructure', amount: 950000.00, status: 'lost', timeAgo: '6 hours ago' },
    { id: 'BID-4985', projectTitle: 'Annual Office Supply Contract Renewal Q3', budget: 2200000.00, category: 'Procurement', amount: 2100000.00, status: 'pending', timeAgo: '1 day ago' },
];

// --- UTILITY FUNCTION ---
function formatCurrency(value: number | undefined | null): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return "₱0.00";
    }
    // Using Philippine Peso (PHP) format for thousands separator and decimals
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

// --- SUB-COMPONENT: Bid Item ---
const BidItem = ({ bid }: { bid: Bid }) => {
    let statusIcon;
    let statusClass;
    let statusText;
    let accentColor;
    let projectIcon; // Icon for the top left section

    switch (bid.status) {
        case 'won':
            statusIcon = <CheckCircle className="w-4 h-4" />;
            statusClass = "text-green-800 bg-green-200 dark:bg-green-700/50";
            statusText = "WON";
            accentColor = "text-green-500";
            projectIcon = <Zap className="w-6 h-6 text-white" />;
            break;
        case 'lost':
            statusIcon = <XCircle className="w-4 h-4" />;
            statusClass = "text-red-800 bg-red-200 dark:bg-red-700/50";
            statusText = "LOST";
            accentColor = "text-red-500";
            projectIcon = <XCircle className="w-6 h-6 text-white" />;
            break;
        case 'pending':
        default:
            statusIcon = <Clock className="w-4 h-4" />;
            statusClass = "text-yellow-800 bg-yellow-200 dark:bg-yellow-700/50";
            statusText = "PENDING";
            accentColor = "text-amber-500";
            projectIcon = <Clock className="w-6 h-6 text-white" />;
            break;
    }

    // Choose icon based on category (optional, for visual variation)
    if (bid.category === 'Technology') {
        projectIcon = <Code className="w-6 h-6 text-white" />;
    } else if (bid.category === 'Infrastructure') {
        projectIcon = <Briefcase className="w-6 h-6 text-white" />;
    }

    // Card background gradient (from announcement theme)
    const cardBgClass = "bg-gradient-to-br from-red-50 via-orange-50 to-amber-100/70 dark:from-red-950 dark:via-orange-950 dark:to-amber-900/80";

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer 
                hover:scale-[1.01] hover:shadow-2xl 
                ${cardBgClass}
                shadow-xl 
                min-h-48 // Ensured uniform height
            `}
        >
            <div className="flex flex-col h-full">

                {/* TOP SECTION: ICON & TITLE */}
                <div className="flex items-start gap-4 mb-4">

                    {/* Large Gradient Icon Wrapper (Matching the image) */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 shadow-lg flex-shrink-0">
                        {projectIcon}
                    </div>

                    {/* Title and Status Badge (Project Name acts as the main title) */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-xl font-extrabold text-red-900 dark:text-orange-100 truncate">
                            {bid.projectTitle}
                        </h3>
                        {/* Smaller status badge placed next to title */}
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold w-fit mt-1 ${statusClass}`}>
                            {statusIcon} {statusText}
                        </span>
                    </div>
                </div>

                {/* MIDDLE SECTION: DETAILS (FLEX-GROW ensures content pushes the footer down) */}
                <div className="flex flex-col text-sm text-orange-800 dark:text-orange-300 mb-4 flex-grow">

                    {/* Category */}
                    <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-red-500 dark:text-red-300" />
                        <span className="font-semibold">{bid.category}</span>
                    </span>

                    {/* Budget */}
                    <span className="flex items-center gap-1 mt-1">
                        <DollarSign className="w-4 h-4 text-red-500 dark:text-red-300" />
                        Budget: <span className="font-bold">{formatCurrency(bid.budget)}</span>
                    </span>

                    {/* Time Ago */}
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-3">
                        <Clock className="w-3 h-3" /> Bid placed {bid.timeAgo}
                    </span>
                </div>

                {/* BOTTOM SECTION: BID AMOUNT (Simulated prominent CTA Button) */}
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Bid Amount
                    </span>
                    <span
                        className="
                            px-4 py-2 rounded-xl text-lg font-black text-white shadow-xl transition-all duration-300
                            bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600
                            cursor-pointer tracking-wide
                        "
                        title={`Your Bid: ${formatCurrency(bid.amount)}`}
                    >
                        {formatCurrency(bid.amount)}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT (UPDATED for horizontal layout) ---
export default function LatestBidsCard() {
    // Slice to get only the two latest bids (or up to 3 for the demo image analogy)
    const latestBids = mockBids.slice(0, 3); // Showing 3 items like the reference image

    return (
        <Card className="w-full mx-auto bg-transparent shadow-none border-none">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-red-500 dark:bg-orange-600 text-white shadow-md">
                        <TrendingUp className="h-5 w-5" /> {/* Icon for Bids Summary */}
                    </div>
                    <CardTitle className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                        Latest Bids Summary
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {latestBids.length > 0 ? (
                    // Use a responsive grid to arrange cards horizontally
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestBids.map((bid) => <BidItem key={bid.id} bid={bid} />)}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 rounded-xl border border-dashed dark:border-neutral-700 bg-white dark:bg-neutral-800">
                        No recent bids available.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}