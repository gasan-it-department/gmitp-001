'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Eye, FileText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ExecutiveOrder {
    number: string;
    title: string;
    dateIssued: string;
    description: string;
    fullDescription: string;
    category: string;
}

const executiveOrders: ExecutiveOrder[] = [
    {
        number: 'EO No. 2025-005',
        title: 'Observance of Municipal Solidarity Day',
        dateIssued: 'May 30, 2025',
        description: 'Declares the last Friday of May as a day of municipal unity and volunteerism.',
        fullDescription:
            'This Executive Order establishes the last Friday of May as Municipal Solidarity Day, a day dedicated to fostering unity, community engagement, and volunteerism among all residents. All municipal offices and barangays are encouraged to organize community service activities, cultural programs, and solidarity events that strengthen social bonds and promote civic participation.',
        category: 'Administration',
    },
    {
        number: 'EO No. 2025-004',
        title: 'Regulation on Use of Municipal Vehicles',
        dateIssued: 'April 15, 2025',
        description: 'Establishes rules for the responsible use of government vehicles.',
        fullDescription:
            'This Executive Order sets forth comprehensive guidelines for the proper and responsible use of all municipal government vehicles. It establishes protocols for vehicle assignment, usage monitoring, maintenance schedules, and accountability measures to ensure efficient utilization of public resources and prevent misuse of government property.',
        category: 'Administration',
    },
    {
        number: 'EO No. 2025-003',
        title: 'Intensified Clean and Green Program',
        dateIssued: 'March 2, 2025',
        description: 'Implements an enhanced environmental cleanliness initiative across all barangays.',
        fullDescription:
            'This Executive Order launches an intensified Clean and Green Program aimed at improving environmental cleanliness and sustainability across all barangays. The program includes regular cleanup drives, waste segregation enforcement, tree planting activities, and the establishment of green spaces. All barangay officials are directed to coordinate with the Municipal Environment Office to implement local action plans.',
        category: 'Environment',
    },
    {
        number: 'EO No. 2025-002',
        title: 'Designation of Municipal Information Officer',
        dateIssued: 'February 10, 2025',
        description: 'Assigns an officer to handle official communications and public information.',
        fullDescription:
            'This Executive Order designates a Municipal Information Officer responsible for managing all official communications, public information dissemination, and media relations. The officer shall ensure transparency in government operations, coordinate with various departments for information releases, and serve as the primary point of contact for media inquiries and public information requests.',
        category: 'Administration',
    },
    {
        number: 'EO No. 2025-001',
        title: 'Creation of the Municipal Disaster Response Task Force',
        dateIssued: 'January 5, 2025',
        description: 'Establishes a task force to enhance disaster preparedness and response.',
        fullDescription:
            "This Executive Order creates the Municipal Disaster Response Task Force to strengthen the municipality's capacity for disaster preparedness, response, and recovery. The task force shall be composed of representatives from various municipal offices, barangay officials, and volunteer organizations. It is mandated to develop comprehensive disaster response plans, conduct regular drills, maintain emergency supplies, and coordinate with provincial and national disaster management agencies.",
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

    const categories = useMemo(() => {
        const categorySet = new Set(executiveOrders.map((eo) => eo.category));
        return ['all', ...Array.from(categorySet).sort()];
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

    const latestOrder = executiveOrders[0];

    const handleViewOrder = (order: ExecutiveOrder) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    const handleDownload = (orderNumber: string) => {
        // Mock download functionality
        console.log(`Downloading ${orderNumber}`);
        alert(`Downloading ${orderNumber}.pdf`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-6 md:py-8">
                    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Browse all Executive Orders issued by the Municipal Mayor. These orders guide the implementation of local policies, programs,
                        and public services.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Latest Executive Order Banner */}
                <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader>
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="default" className="bg-accent text-accent-foreground">
                                Latest
                            </Badge>
                            <span className="text-sm text-muted-foreground">{latestOrder.dateIssued}</span>
                        </div>
                        <CardTitle className="text-2xl text-balance">{latestOrder.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">{latestOrder.number}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="leading-relaxed text-foreground/90">{latestOrder.description}</p>
                    </CardContent>
                    <CardFooter className="gap-3">
                        <Button onClick={() => handleViewOrder(latestOrder)} className="gap-2 bg-gradient-to-r from-red-500 to-orange-500">
                            <Eye className="h-4 w-4" />
                            View Details
                        </Button>
                        <Button variant="outline" onClick={() => handleDownload(latestOrder.number)} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </CardFooter>
                </Card>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by title, number, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[140px]">
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
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories
                                        .filter((c) => c !== 'all')
                                        .map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                        </span>
                        {(searchQuery || selectedYear !== 'all' || selectedCategory !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedYear('all');
                                    setSelectedCategory('all');
                                }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Executive Orders Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                        <Card key={order.number} className="flex flex-col transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {order.number}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {order.category}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg leading-snug text-balance">{order.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5 text-sm">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {order.dateIssued}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm leading-relaxed text-muted-foreground">{order.description}</p>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleViewOrder(order)}
                                    className="flex-1 gap-1.5 bg-gradient-to-r from-red-500 to-orange-500"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    View
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDownload(order.number)} className="gap-1.5">
                                    <Download className="h-3.5 w-3.5" />
                                    PDF
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-12 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No executive orders found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </main>

            {/* View Order Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <div className="mb-3 flex items-center gap-2">
                                    <Badge variant="secondary" className="font-mono">
                                        {selectedOrder.number}
                                    </Badge>
                                    <Badge variant="outline">{selectedOrder.category}</Badge>
                                </div>
                                <DialogTitle className="text-2xl leading-snug text-balance">{selectedOrder.title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-2 text-base">
                                    <Calendar className="h-4 w-4" />
                                    Date Issued: {selectedOrder.dateIssued}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div>
                                    <h4 className="mb-2 font-semibold text-foreground">Summary</h4>
                                    <p className="leading-relaxed text-muted-foreground">{selectedOrder.description}</p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-semibold text-foreground">Full Description</h4>
                                    <p className="leading-relaxed text-foreground/90">{selectedOrder.fullDescription}</p>
                                </div>
                                <div className="border-t border-border pt-4">
                                    <Button
                                        onClick={() => handleDownload(selectedOrder.number)}
                                        className="w-full gap-2 bg-gradient-to-r from-red-500 to-orange-500"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Full PDF Document
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Footer
            <footer className="mt-16 border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-sm text-muted-foreground">
                        <p className="mb-2">For inquiries regarding Executive Orders, please contact the Office of the Municipal Mayor</p>
                        <p>© {new Date().getFullYear()} Municipal Government. All rights reserved.</p>
                    </div>
                </div>
            </footer> */}
        </div>
    );
}
