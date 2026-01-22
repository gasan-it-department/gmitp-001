import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/App/AppLayout';
import { AlertTriangle, FileText, MapPin, Plus, Search, Users } from 'lucide-react';

export default function CemeteryDashboard() {
    return (
        <AppLayout>
            <div className="min-h-screen space-y-8 bg-slate-50/50 p-8">
                {/* 1. Header & Primary Actions */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cemetery Overview</h1>
                        <p className="text-slate-500">Gasan Municipal Cemetery • Operations Panel</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Quick action to start the workflow we discussed */}
                        <Button className="bg-slate-900 hover:bg-slate-800">
                            <Plus className="mr-2 h-4 w-4" /> New Interment
                        </Button>
                    </div>
                </div>

                {/* 2. Key Metrics (The Health of the System) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Interments</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12,345</div>
                            <p className="text-xs text-muted-foreground">+18 this month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Plot Occupancy</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">82%</div>
                            <p className="text-xs text-muted-foreground">412 Available Plots</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Burials</CardTitle>
                            <FileText className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">3</div>
                            <p className="text-xs text-muted-foreground">Scheduled for this week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lease Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">12</div>
                            <p className="text-xs text-muted-foreground">Expiring in {'< 30 days'}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. The "Work Bench" Area */}
                <div className="grid gap-4 md:grid-cols-7">
                    {/* Recent Activity Table (Takes up 4 columns) */}
                    <Card className="md:col-span-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Interments</CardTitle>
                                <div className="relative w-48">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search name..." className="h-9 pl-8" />
                                </div>
                            </div>
                            <CardDescription>Latest records added to the registry.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deceased Name</TableHead>
                                        <TableHead>Date of Death</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Mock Row 1 */}
                                    <TableRow>
                                        <TableCell className="font-medium">DELA CRUZ, JUAN</TableCell>
                                        <TableCell>Jan 12, 2026</TableCell>
                                        <TableCell>BLK-A / LOT-102</TableCell>
                                        <TableCell>
                                            <Badge className="bg-emerald-600">Buried</Badge>
                                        </TableCell>
                                    </TableRow>
                                    {/* Mock Row 2 */}
                                    <TableRow>
                                        <TableCell className="font-medium">SANTOS, MARIA</TableCell>
                                        <TableCell>Jan 20, 2026</TableCell>
                                        <TableCell className="text-slate-400 italic">Unassigned</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600">
                                                Pending
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Quick Plot Status (Takes up 3 columns) */}
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Capacity by Section</CardTitle>
                            <CardDescription>Quick view of available space types.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Apartment/Niche Status */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Apartment Niches</span>
                                    <span className="text-slate-500">45/100 Occupied</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-blue-600" style={{ width: '45%' }}></div>
                                </div>
                            </div>

                            {/* Ground Lot Status */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Ground Lots (Catholic)</span>
                                    <span className="text-slate-500">890/1000 Occupied</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: '89%' }}></div>
                                </div>
                            </div>

                            {/* Bone Crypt Status */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Bone Crypts</span>
                                    <span className="text-slate-500">12/200 Occupied</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: '6%' }}></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
