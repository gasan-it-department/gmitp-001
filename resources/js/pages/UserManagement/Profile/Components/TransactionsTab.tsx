import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBar from '@/pages/Utility/SearchBar';
import { DollarSign, FileText, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    { id: 'T1001', type: 'Payment', description: 'Business Permit Renewal', amount: 12500.0, status: 'Completed', date: '2025-11-28' },
    { id: 'T1002', type: 'Report', description: 'Community Issue Report #45', amount: 0.0, status: 'Pending', date: '2025-11-27' },
    { id: 'T1003', type: 'Payment', description: 'Real Property Tax (Q4)', amount: 8450.5, status: 'Completed', date: '2025-11-25' },
    { id: 'T1004', type: 'Report', description: 'Feedback Form Submission', amount: 0.0, status: 'Completed', date: '2025-11-24' },
    { id: 'T1005', type: 'Payment', description: 'Building Permit Fee', amount: 3200.0, status: 'Failed', date: '2025-11-22' },
];

// --- THEME HELPERS ---
const primaryGradient = 'bg-gradient-to-r from-red-500 to-orange-500';
const textGradient = 'bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent';
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
        <div className="flex items-center justify-between border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className={`rounded-full p-2 ${isPayment ? 'bg-blue-100' : 'bg-orange-100'} text-blue-600 dark:bg-neutral-700`}>
                    {isPayment ? <DollarSign className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold text-gray-900 dark:text-gray-100">{transaction.description}</span>
                    <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {transaction.id} | {transaction.type}
                    </span>
                </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <span className={`text-sm font-bold ${isPayment ? textGradient : 'text-gray-500 dark:text-gray-400'}`}>{amountDisplay}</span>
                <Badge className={`text-xs font-medium ${statusClass}`}>{transaction.status}</Badge>
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
        const matchesSearch =
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
        const matchesType = filterType === 'all' || tx.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        try {
        } catch (error: any) {}
    };

    return (
        <Card className="flex h-full w-full flex-1 flex-col rounded-none shadow-sm dark:bg-neutral-900">
            <CardHeader className="border-b bg-white px-6 py-4 dark:bg-neutral-800">
                <CardTitle className={`text-2xl font-bold`}>Transactions</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all financial payments, community reports, and service requests.
                </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
                {/* --- FILTERS & SEARCH --- */}
                <div className="flex flex-col gap-4">
                    <SearchBar
                        onSearch={(keyword) => {
                            console.log('Searching for ' + keyword);
                        }}
                        searchBarHint={'Search transactions, ID or type'}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Status Filter */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="sm:w-[150px] dark:border-neutral-700 dark:bg-neutral-900">
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
                            <SelectTrigger className="sm:w-[150px] dark:border-neutral-700 dark:bg-neutral-900">
                                <SelectValue placeholder="Filter Type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-neutral-800">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Payment">Payment</SelectItem>
                                <SelectItem value="Report">Report/Request</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="ghost"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => {
                                setFilterStatus('all');
                                setFilterType('all');
                                setSearchTerm('');
                            }}
                        >
                            <Filter className="mr-2 h-4 w-4" /> Clear Filters
                        </Button>
                    </div>
                </div>

                {/* --- TRANSACTION LIST --- */}
                <div className="space-y-1">
                    <div className="border-b pb-2 text-xs font-semibold text-gray-500 uppercase dark:border-neutral-800 dark:text-gray-400">
                        Showing {filteredTransactions.length} of {mockTransactions.length} results
                    </div>

                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
                    ) : (
                        <div className="mt-4 rounded-xl border-2 border-dashed py-10 text-center text-gray-500 dark:border-neutral-700 dark:text-gray-400">
                            No transactions matched your criteria.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
