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
const textGradient = 'text-primary';
// ---------------------

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
}

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const isPayment = transaction.type === 'Payment';
    // Handle the case where amount is 0.00 and it's a Report/Request type
    const amountDisplay = isPayment ? formatCurrency(transaction.amount) : 'N/A';

    let statusClass;
    let statusDisplay;

    switch (transaction.status) {
        case 'Completed':
            statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            statusDisplay = 'Kumpleto';
            break;
        case 'Pending':
            statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            statusDisplay = 'Pinoproseso';
            break;
        case 'Failed':
            statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            statusDisplay = 'Bigo';
            break;
    }

    return (
        <div className="flex items-center justify-between border-b border-border p-4 transition-colors hover:bg-muted/50 last:border-b-0">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className={`rounded-full p-2 ${isPayment ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'} dark:bg-neutral-800`}>
                    {isPayment ? <DollarSign className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold text-foreground">{transaction.description}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                        {transaction.id} | {isPayment ? 'Pagbabayad' : 'Ulat / Kahilingan'}
                    </span>
                </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <span className={`text-sm font-bold ${isPayment ? 'text-primary' : 'text-muted-foreground'}`}>{amountDisplay}</span>
                <Badge className={`text-xs font-medium ${statusClass}`}>{statusDisplay}</Badge>
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
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <h2 className="font-heading text-xl font-bold tracking-tight">Mga Transaksyon</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Tingnan at pamahalaan ang lahat ng mga bayarin, ulat sa komunidad, at mga kahilingan sa serbisyo.
                </p>
            </div>

            <Card className="overflow-hidden rounded-2xl border-border p-4 shadow-sm md:p-8">
                <div className="space-y-6">
                    {/* --- FILTERS & SEARCH --- */}
                    <div className="flex flex-col gap-4">
                        <SearchBar
                            onSearch={(keyword) => {
                                setSearchTerm(keyword);
                            }}
                            searchBarHint={'Maghanap ng mga transaksyon, ID o uri'}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {/* Status Filter */}
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="sm:w-[180px] rounded-xl h-10">
                                    <SelectValue placeholder="Filter ng Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Lahat ng Status</SelectItem>
                                    <SelectItem value="Completed">Kumpleto</SelectItem>
                                    <SelectItem value="Pending">Pinoproseso</SelectItem>
                                    <SelectItem value="Failed">Bigo</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Filter */}
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="sm:w-[180px] rounded-xl h-10">
                                    <SelectValue placeholder="Filter ng Uri" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Lahat ng Uri</SelectItem>
                                    <SelectItem value="Payment">Pagbabayad</SelectItem>
                                    <SelectItem value="Report">Ulat / Kahilingan</SelectItem>
                                </SelectContent>
                            </Select>

                            {(filterStatus !== 'all' || filterType !== 'all' || searchTerm !== '') && (
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-primary rounded-xl h-10"
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setFilterType('all');
                                        setSearchTerm('');
                                    }}
                                >
                                    <Filter className="mr-2 h-4 w-4" /> Linisin ang Filter
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* --- TRANSACTION LIST --- */}
                    <div className="space-y-2">
                        <div className="border-b border-border pb-2 text-xs font-semibold text-muted-foreground uppercase">
                            Ipinapakita ang {filteredTransactions.length} sa {mockTransactions.length} na resulta
                        </div>

                        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden bg-card">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
                            ) : (
                                <div className="py-12 text-center text-sm text-muted-foreground">
                                    Walang transaksyon na tumutugma sa iyong filter.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
