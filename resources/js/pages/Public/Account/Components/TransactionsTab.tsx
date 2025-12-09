import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, FileText, Filter, Calendar, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import SearchBar from "@/pages/Utility/SearchBar";

// --- INTERFACES ---
interface Transaction {
    id: string;
    type: 'Payment' | 'Report';
    description: string;
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
    date: string;
}

// --- MOCK DATA ---
const mockTransactions: Transaction[] = [
    { id: 'T1001', type: 'Payment', description: 'Business Permit Renewal', amount: 12500.00, status: 'Completed', date: '2025-11-28' },
    { id: 'T1002', type: 'Report', description: 'Community Issue Report #45', amount: 0.00, status: 'Pending', date: '2025-11-27' },
    { id: 'T1003', type: 'Payment', description: 'Real Property Tax (Q4)', amount: 8450.50, status: 'Completed', date: '2025-11-25' },
    { id: 'T1004', type: 'Report', description: 'Feedback Form Submission', amount: 0.00, status: 'Completed', date: '2025-11-24' },
    { id: 'T1005', type: 'Payment', description: 'Building Permit Fee', amount: 3200.00, status: 'Failed', date: '2025-11-22' },
];

// --- THEME HELPERS ---
const primaryGradient = "bg-gradient-to-r from-red-500 to-orange-500";
const textGradient = "bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent";
// ---------------------

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
}

// --- FIX: TransactionItem now has explicit typing ---
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const isPayment = transaction.type === 'Payment';
    // Handle the case where amount is 0.00 and it's a Report/Request type
    const amountDisplay = isPayment ? formatCurrency(transaction.amount) : 'N/A';

    let statusClass;
    // Icon is determined by status below, but we don't need the 'icon' variable inside the switch for this layout

    switch (transaction.status) {
        case 'Completed':
            statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            break;
        case 'Pending':
            statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            break;
        case 'Failed':
            statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            break;
    }

    return (
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-neutral-800 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800">
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`p-2 rounded-full ${isPayment ? 'bg-blue-100' : 'bg-orange-100'} text-blue-600 dark:bg-neutral-700`}>
                    {isPayment ? <DollarSign className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{transaction.description}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{transaction.id} | {transaction.type}</span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-sm font-bold ${isPayment ? textGradient : 'text-gray-500 dark:text-gray-400'}`}>
                    {amountDisplay}
                </span>
                <Badge className={`text-xs font-medium ${statusClass}`}>
                    {transaction.status}
                </Badge>
            </div>
        </div>
    );
};

export default function TransactionsTab() {
    const [transactions, setTransactions] = useState(mockTransactions);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = transactions.filter((tx: Transaction) => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
        const matchesType = filterType === 'all' || tx.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        try {

        } catch (error: any) {

        }
    }


    return (
        <Card className="flex h-full w-full flex-1 flex-col rounded-none shadow-sm dark:bg-neutral-900">
            <CardHeader className="border-b bg-white dark:bg-neutral-800 px-6 py-4">
                <CardTitle className={`text-2xl font-bold`}>
                    Transactions
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all financial payments, community reports, and service requests.
                </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">

                {/* --- FILTERS & SEARCH --- */}
                <div className="flex flex-col gap-4">
                    <SearchBar onSearch={(keyword) => {
                        console.log("Searching for " + keyword);

                    }} searchBarHint={'Search transactions, ID or type'} />

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Status Filter */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="sm:w-[150px] dark:bg-neutral-900 dark:border-neutral-700">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-neutral-800">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Type Filter */}
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="sm:w-[150px] dark:bg-neutral-900 dark:border-neutral-700">
                                <SelectValue placeholder="Filter Type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-neutral-800">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Payment">Payment</SelectItem>
                                <SelectItem value="Report">Report/Request</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="ghost" className="text-gray-500 hover:text-red-500" onClick={() => { setFilterStatus('all'); setFilterType('all'); setSearchTerm(''); }}>
                            <Filter className="w-4 h-4 mr-2" /> Clear Filters
                        </Button>
                    </div>
                </div>

                {/* --- TRANSACTION LIST --- */}
                <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 pb-2 border-b dark:border-neutral-800">
                        Showing {filteredTransactions.length} of {mockTransactions.length} results
                    </div>

                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400 border-2 border-dashed dark:border-neutral-700 rounded-xl mt-4">
                            No transactions matched your criteria.
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}