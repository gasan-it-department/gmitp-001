import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { cn } from '@/lib/utils';
import tourism from '@/routes/tourism';
import { Link, usePage } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
// 1. Define the TypeScript Interface based on our Laravel DTO
interface TourismAsset {
    id: string;
    type: 'spot' | 'establishment' | 'event' | 'heritage';
    name: string;
    is_published: boolean;
    cover_url?: string;
    meta: any; // The JSON pocket
}

export default function TourismAssetList({ initialAssets = [] }: { initialAssets: TourismAsset[] }) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    // 2. State for the Active Tab (Filter)
    const [activeFilter, setActiveFilter] = useState('all');

    // 3. Derived State: Filter the list instantly without touching the database
    const filteredAssets = initialAssets.filter((asset) => {
        if (activeFilter === 'all') return true;
        return asset.type === activeFilter;
    });

    // Helper function to color-code the badges
    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'establishment':
                return 'default'; // Blue/Primary
            case 'event':
                return 'secondary'; // Gray/Muted
            case 'spot':
                return 'outline'; // White with border
            case 'heritage':
                return 'destructive'; // Red/Orange (or create a custom theme color)
            default:
                return 'default';
        }
    };

    // Helper to format the "Subtext" depending on the asset type
    const getSubtext = (asset: TourismAsset) => {
        if (asset.type === 'establishment') return asset.meta?.address || 'No address provided';
        if (asset.type === 'event') return `Starts: ${asset.meta?.start_date || 'TBA'}`;
        return asset.meta?.historical_era || 'Gasan, Marinduque';
    };

    return (
        <AppLayout>
            <div className="m-6 space-y-6">
                {/* Header Area */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tourism Directory</h1>
                        <p className="text-muted-foreground">Manage all spots, events, and businesses in Gasan.</p>
                    </div>
                    <Link
                        href={tourism.admin.asset.create.url(currentMunicipality.slug)}
                        className={cn(buttonVariants({ variant: 'default' }), 'flex items-center')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Asset
                    </Link>
                </div>

                {/* The Magic Filter Tabs */}
                <Tabs defaultValue="all" onValueChange={setActiveFilter} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All Assets</TabsTrigger>
                        <TabsTrigger value="spot">Tourist Spots</TabsTrigger>
                        <TabsTrigger value="establishment">Establishments</TabsTrigger>
                        <TabsTrigger value="event">Events</TabsTrigger>
                        <TabsTrigger value="heritage">Heritage Sites</TabsTrigger>
                    </TabsList>

                    <div className="rounded-md border bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Asset Details</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                            No assets found for this category.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            {/* Thumbnail Column */}
                                            <TableCell>
                                                <div className="h-12 w-12 overflow-hidden rounded-md border bg-slate-100">
                                                    {asset.cover_url ? (
                                                        <img src={asset.cover_url} alt={asset.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Name & Subtext Column */}
                                            <TableCell>
                                                <div className="font-semibold text-slate-900">{asset.name}</div>
                                                <div className="text-xs text-muted-foreground">{getSubtext(asset)}</div>
                                            </TableCell>

                                            {/* Type Badge Column */}
                                            <TableCell>
                                                <Badge variant={getBadgeVariant(asset.type)} className="capitalize">
                                                    {asset.type}
                                                </Badge>
                                            </TableCell>

                                            {/* Status Column */}
                                            <TableCell>
                                                {asset.is_published ? (
                                                    <span className="flex items-center text-sm font-medium text-green-600">
                                                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-sm font-medium text-slate-500">
                                                        <span className="mr-2 h-2 w-2 rounded-full bg-slate-300"></span> Draft
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Actions Dropdown Column */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4 text-slate-500" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Record
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
