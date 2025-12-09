'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileSignature, Search, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ViewOrderDialog } from './ViewExecutiveOrderDialog';
import { ExecutiveOrder } from '@/Core/Types/ExecutiveOrders/ExecutiveOrders';
import SearchBar from '@/pages/Utility/SearchBar';

// Mock Data
const executiveOrders: ExecutiveOrder[] = [
    {
        number: 'EO No. 2025-005',
        title: 'Observance of Municipal Solidarity Day',
        dateIssued: 'May 30, 2025',
        description: 'Declares the last Friday of May as a day of municipal unity and volunteerism.',
        category: 'Administration',
    },
    {
        number: 'EO No. 2025-004',
        title: 'Regulation on Use of Municipal Vehicles',
        dateIssued: 'April 15, 2025',
        description: 'Establishes rules for the responsible use of government vehicles.',
        category: 'Administration',
    },
    {
        number: 'EO No. 2025-003',
        title: 'Intensified Clean and Green Program',
        dateIssued: 'March 2, 2025',
        description: 'Implements an enhanced environmental cleanliness initiative across all barangays.',
        category: 'Environment',
    },
    {
        number: 'EO No. 2025-002',
        title: 'Designation of Municipal Information Officer',
        dateIssued: 'February 10, 2025',
        description: 'Assigns an officer to handle official communications and public information.',
        category: 'Administration',
    },
    {
        number: 'EO No. 2025-001',
        title: 'Creation of the Municipal Disaster Response Task Force',
        dateIssued: 'January 5, 2025',
        description: 'Establishes a task force to enhance disaster preparedness and response.',
        category: 'Public Safety',
    },
];

export function ExecutiveOrders() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<ExecutiveOrder | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const years = useMemo(() => {
        const yearSet = new Set(executiveOrders.map((eo) => new Date(eo.dateIssued).getFullYear().toString()));
        return ['all', ...Array.from(yearSet).sort().reverse()];
    }, []);

    const filteredOrders = useMemo(() => {
        return executiveOrders.filter((order) => {
            const matchesSearch =
                order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || new Date(order.dateIssued).getFullYear().toString() === selectedYear;
            const matchesCategory = selectedCategory === 'all' || order.category === selectedCategory;

            return matchesSearch && matchesYear && matchesCategory;
        });
    }, [searchQuery, selectedYear, selectedCategory]);

    const handleViewOrder = (order: ExecutiveOrder) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    const handleDownload = (orderNumber: string) => {
        console.log(`Downloading ${orderNumber}`);
        alert(`Downloading ${orderNumber}.pdf`);
    };
    const primaryGradient = "bg-gradient-to-r from-red-500 to-orange-500";
    const textGradient = "bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent";

    const handleSearchQuery = async (query: string) => {
        try{
            if(query === ""){
                // CALL API TO LOAD THE DEFAULT LIST HERE. GO BACK TO ORIGINAL LIST.
                // const response = await ExecutiveOrderApi.loadExecutiveOrders( page: 1);
                // if(response.success){
                //     // REFRESH LIST
                // }
            }else{
                // CALL API TO SEARCH FOR QUERY
                // const response = await ExecutiveOrderApi.searchFor(query);
                // if(response.success){
                //     // REFRESH LIST
                // }
            }
        }catch(error: any){

        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">

            {/* HEADER SECTION */}
            <header className="border-b border-orange-100 bg-orange-50/30 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="container mx-auto px-4 py-10 md:py-12">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className={`p-4 rounded-2xl ${primaryGradient} shadow-lg text-white`}>
                            <FileSignature className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${textGradient} dark:text-white`}>
                                Executive Orders
                            </h1>
                            <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
                                Access official directives issued by the Municipal Mayor guiding local policies,
                                programs, and public services.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">

                {/* FILTERS & SEARCH */}
                <div className="mb-8 space-y-4 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <SearchBar onSearch={(keyword) => {
                            handleSearchQuery(keyword);
                        }} searchBarHint={'Search transactions, ID or type'} />
                        <div className="flex gap-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[140px] border-gray-300 focus:ring-orange-200 dark:border-neutral-700">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {years.filter((y) => y !== 'all').map((year) => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 pt-2">
                        <span>Showing {filteredOrders.length} results</span>
                        {(searchQuery || selectedYear !== 'all' || selectedCategory !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedYear('all');
                                    setSelectedCategory('all');
                                }}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-auto p-0"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* ORDERS GRID */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                        <Card
                            key={order.number}
                            onClick={() => handleViewOrder(order)}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer dark:bg-neutral-900 dark:border-neutral-800"
                        >
                            {/* Decorative Top Border */}
                            <div className={`h-1.5 w-full ${primaryGradient}`} />

                            <CardHeader className="pb-3 flex-1">
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <Badge variant="secondary" className="font-mono text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                        {order.number}
                                    </Badge>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {order.dateIssued}
                                    </span>
                                </div>
                                <CardTitle className="text-lg font-bold leading-tight text-gray-800 group-hover:text-red-600 transition-colors dark:text-gray-100 dark:group-hover:text-orange-400">
                                    {order.title}
                                </CardTitle>
                            </CardHeader>

                            {/* Description CardContent REMOVED for cleaner, more compact look */}

                            <CardFooter className="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900 mt-auto">
                                <div className="flex w-full items-center justify-between">
                                    <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200 bg-white dark:bg-neutral-800 dark:border-neutral-700">
                                        {order.category}
                                    </Badge>
                                    <div className="flex items-center text-xs font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                                        Read More <ChevronRight className="ml-1 h-3 w-3" />
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:bg-neutral-900 dark:border-neutral-800">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                            <Search className="h-8 w-8 text-orange-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">No results found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            We couldn't find any Executive Orders matching your current filters.
                        </p>
                        <Button
                            variant="link"
                            className="mt-4 text-red-600"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedYear('all');
                                setSelectedCategory('all');
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </main>

            {/* VIEW ORDER DIALOG */}
            <ViewOrderDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                order={selectedOrder}
                onDownload={handleDownload}
            />
        </div>
    );
}