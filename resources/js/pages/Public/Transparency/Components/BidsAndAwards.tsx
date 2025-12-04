import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ExternalLink, FileText, Gavel, FileCheck, Banknote } from 'lucide-react';
import { useState, useMemo } from 'react';

const bids = [
    {
        title: 'Construction of Municipal Health Center',
        type: 'Infrastructure',
        status: 'Open',
        deadline: '2025-02-15',
        budget: '₱5,000,000',
    },
    {
        title: 'Supply and Delivery of Office Equipment',
        type: 'Goods',
        status: 'Awarded',
        deadline: '2025-01-20',
        budget: '₱850,000',
    },
    {
        title: 'Road Rehabilitation Project - Barangay Roads',
        type: 'Infrastructure',
        status: 'Evaluation',
        deadline: '2025-01-30',
        budget: '₱3,200,000',
    },
    {
        title: 'Software Licensing Renewal 2025-2026',
        type: 'Services',
        status: 'Open',
        deadline: '2025-03-10',
        budget: '₱450,000',
    },
    {
        title: 'Supply of COVID-19 Test Kits',
        type: 'Goods',
        status: 'Awarded',
        deadline: '2024-11-05',
        budget: '₱1,100,000',
    },
];

// Helper function for badge variant coloring
const getBadgeVariant = (status: string) => {
    switch (status) {
        case 'Open':
            return 'default';
        case 'Awarded':
            return 'secondary';
        case 'Evaluation':
            return 'outline';
        default:
            return 'outline';
    }
};

export function BidsAndAwards() {
    const [activeTab, setActiveTab] = useState('biddings'); // 'biddings' or 'awards'

    const filteredBids = useMemo(() => {
        if (activeTab === 'biddings') {
            // Show Open and Evaluation items
            return bids.filter(bid => bid.status === 'Open' || bid.status === 'Evaluation');
        } else {
            // Show Awarded items
            return bids.filter(bid => bid.status === 'Awarded');
        }
    }, [activeTab]);

    const BiddingCount = bids.filter(bid => bid.status === 'Open' || bid.status === 'Evaluation').length;
    const AwardCount = bids.filter(bid => bid.status === 'Awarded').length;

    // --- THEME COLORS ---
    const primaryGradient = 'bg-gradient-to-r from-red-500 to-orange-500';
    const primaryText = 'text-red-700 dark:text-orange-200';
    const primaryBgHover = 'hover:bg-red-50/50 dark:hover:bg-red-900/40';
    const activeTabClasses = `${primaryGradient} text-white shadow-md hover:from-red-600 hover:to-orange-600`;
    // --------------------

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
                <div className="flex space-x-3 border-b border-gray-200 dark:border-neutral-700 pb-2">
                    <Button
                        variant={activeTab === 'biddings' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('biddings')}
                        className={`font-semibold transition-all duration-200 ${activeTab === 'biddings' ? activeTabClasses : primaryText + ' ' + primaryBgHover}`}
                    >
                        <Banknote className="h-4 w-4 mr-2" />
                        Biddings ({BiddingCount})
                    </Button>
                    <Button
                        variant={activeTab === 'awards' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('awards')}
                        className={`font-semibold transition-all duration-200 ${activeTab === 'awards' ? activeTabClasses : primaryText + ' ' + primaryBgHover}`}
                    >
                        <Award className="h-4 w-4 mr-2" />
                        Awards ({AwardCount})
                    </Button>
                </div>

                {/* FILTERED LIST CONTENT */}
                <div className="space-y-4">
                    {filteredBids.length > 0 ? (
                        filteredBids.map((bid, index) => (
                            <div
                                key={index}
                                className={`
                                    space-y-3 rounded-xl border border-red-200/60 dark:border-red-900/40 p-4 transition-all duration-300 cursor-pointer
                                    // Use the warm gradient background
                                    bg-gradient-to-br from-red-50/70 via-orange-50/70 to-amber-100/70
                                    dark:from-red-950/70 dark:via-orange-950/70 dark:to-amber-900/70
                                    hover:shadow-lg hover:border-red-400
                                `}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Title and Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="mb-1 font-bold text-lg text-red-900 dark:text-orange-100 truncate">{bid.title}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-orange-800/80 dark:text-orange-200/80">
                                            <span className="font-medium">{bid.type}</span>
                                            <span className="text-gray-400">•</span>
                                            {/* <span className="font-medium">Budget: {bid.budget}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="font-medium">Deadline: {bid.deadline}</span> */}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <Badge
                                        variant={getBadgeVariant(bid.status)}
                                        className={`font-bold text-sm h-7 flex items-center shadow-sm ${
                                            // Red/Orange themed status colors
                                            bid.status === 'Open' ? 'bg-green-600 text-white hover:bg-green-700' :
                                                bid.status === 'Evaluation' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                                                    'bg-blue-600 text-white hover:bg-blue-700' // Keeping Awarded as blue for contrast
                                            }`}
                                    >
                                        {bid.status}
                                    </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" className={`gap-2 bg-white dark:bg-neutral-900 border-red-500 ${primaryText} hover:bg-red-50/50`}>
                                        <FileText className="h-4 w-4" />
                                        View PDF
                                    </Button>

                                    {bid.status === 'Awarded' && (
                                        <Button size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                            <Award className="h-4 w-4" />
                                            Notice of Award
                                        </Button>
                                    )}

                                    {/* {bid.status === 'Evaluation' && (
                                        <Button size="sm" className="gap-2 bg-yellow-600 text-white hover:bg-yellow-700">
                                            <FileCheck className="h-4 w-4" />
                                            Bid Documents
                                        </Button>
                                    )} */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed rounded-lg bg-white dark:bg-neutral-800">
                            {activeTab === 'biddings' ? 'No active procurement bids at this time.' : 'No recent awards issued.'}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}