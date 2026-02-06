'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExecutiveOrder } from '@/Core/Types/ExecutiveOrders/ExecutiveOrders';
import SearchBar from '@/pages/Utility/SearchBar';
import { Calendar, ChevronRight, FileSignature, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ViewOrderDialog } from './ViewExecutiveOrderDialog';

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

    const handleSearchQuery = async (query: string) => {
        try {
            if (query === '') {
                // Call API to reload default list
            } else {
                // Call API to search
            }
        } catch (error: any) {}
    };

    return (
        // Main Container: Uses 'bg-background'
        <div className="min-h-screen bg-background">
            {/* HEADER SECTION */}
            {/* Uses 'bg-muted/30' for subtle contrast header, 'border-border' for separator */}
            <header className="border-b border-border bg-muted/20">
                <div className="container mx-auto px-4 py-10 md:py-12">
                    <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                        {/* Icon Box: 'bg-primary' with 'text-primary-foreground' */}
                        <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg">
                            <FileSignature className="h-8 w-8" />
                        </div>
                        <div>
                            {/* Title: 'text-foreground' */}
                            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                                Executive Orders
                            </h1>
                            {/* Description: 'text-muted-foreground' */}
                            <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                                Access official directives issued by the Municipal Mayor guiding local policies, programs, and public services.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* FILTERS & SEARCH */}
                {/* Filter Box: 'bg-card', 'border-border' */}
                <div className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <SearchBar
                            onSearch={(keyword) => {
                                handleSearchQuery(keyword);
                            }}
                            searchBarHint={'Search transactions, ID or type'}
                        />
                        <div className="flex gap-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[140px] border-input focus:ring-ring">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {years
                                        .filter((y) => y !== 'all')
                                        .map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-medium text-muted-foreground">
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
                                className="h-auto p-0 text-destructive hover:bg-transparent hover:text-destructive/80"
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
                            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Decorative Top Border: Uses 'bg-primary' */}
                            <div className="h-1.5 w-full bg-primary" />

                            <CardHeader className="flex-1 pb-3">
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    {/* Badge: Uses 'secondary' variant automatically mapped to theme */}
                                    <Badge variant="secondary" className="font-mono text-xs font-bold">
                                        {order.number}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" /> {order.dateIssued}
                                    </span>
                                </div>
                                {/* Title: Hover state uses 'text-primary' */}
                                <CardTitle className="text-lg leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
                                    {order.title}
                                </CardTitle>
                            </CardHeader>

                            <CardFooter className="mt-auto border-t border-border bg-muted/30 p-4">
                                <div className="flex w-full items-center justify-between">
                                    <Badge
                                        variant="outline"
                                        className="border-border bg-background text-[10px] text-muted-foreground"
                                    >
                                        {order.category}
                                    </Badge>
                                    <div className="flex items-center text-xs font-semibold text-primary transition-transform group-hover:translate-x-1">
                                        Read More <ChevronRight className="ml-1 h-3 w-3" />
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredOrders.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-border bg-muted/10 py-20 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-foreground">No results found</h3>
                        <p className="mx-auto max-w-sm text-muted-foreground">
                            We couldn't find any Executive Orders matching your current filters.
                        </p>
                        <Button
                            variant="link"
                            className="mt-4 text-primary"
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