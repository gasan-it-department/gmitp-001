import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/App/AppLayout';
import { AlertCircle, FileText, MapPin, Save, User, X } from 'lucide-react';
import { useState } from 'react';

export default function Interment() {
    // Simple state for demonstration.
    // In production, I recommend using 'react-hook-form' + 'zod' for validation.
    const [loading, setLoading] = useState(false);

    return (
        <AppLayout>
            {/* 1. Header Section: Official & Clear */}
            <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Register Interment</h1>
                    <p className="mt-1 text-slate-500">Create a new permanent record in the Municipal Registry.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Saving Record...' : 'Save Official Record'}
                    </Button>
                </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT COLUMN: Personal Information (2/3 width) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* SECTION A: Deceased Profile */}
                    <Card>
                        <CardHeader>
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                                <User className="h-5 w-5" />
                                <span className="text-sm font-semibold tracking-wider uppercase">Deceased Profile</span>
                            </div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Biographical details of the deceased as they appear on legal documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {/* Name Row */}
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-5">
                                    <Label htmlFor="firstName" className="text-xs text-slate-500 uppercase">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="firstName" placeholder="e.g. JUAN" className="mt-1.5 font-medium uppercase" />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="middleName" className="text-xs text-slate-500 uppercase">
                                        M.I.
                                    </Label>
                                    <Input id="middleName" placeholder="A." className="mt-1.5 font-medium uppercase" />
                                </div>
                                <div className="col-span-5">
                                    <Label htmlFor="lastName" className="text-xs text-slate-500 uppercase">
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="lastName" placeholder="e.g. DELA CRUZ" className="mt-1.5 font-medium uppercase" />
                                </div>
                            </div>

                            {/* Extension & Gender Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="extension" className="text-xs text-slate-500 uppercase">
                                        Extension (Optional)
                                    </Label>
                                    <Input id="extension" placeholder="e.g. JR, III" className="mt-1.5 uppercase" />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500 uppercase">Gender</Label>
                                    <Select>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-2">
                                <div>
                                    <Label htmlFor="dob" className="text-xs text-slate-500 uppercase">
                                        Date of Birth
                                    </Label>
                                    <Input type="date" id="dob" className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="dod" className="text-xs text-slate-500 uppercase">
                                        Date of Death <span className="text-red-500">*</span>
                                    </Label>
                                    <Input type="date" id="dod" className="mt-1.5 border-slate-300 bg-slate-50" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION B: Death Statistics */}
                    <Card>
                        <CardHeader>
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                                <FileText className="h-5 w-5" />
                                <span className="text-sm font-semibold tracking-wider uppercase">Death Statistics</span>
                            </div>
                            <CardTitle>Cause & Certification</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Label htmlFor="cause" className="text-xs text-slate-500 uppercase">
                                        Cause of Death
                                    </Label>
                                    <Input id="cause" placeholder="e.g. Myocardial Infarction" className="mt-1.5" />
                                </div>

                                <div>
                                    <Label htmlFor="certNo" className="text-xs text-slate-500 uppercase">
                                        Death Certificate No.
                                    </Label>
                                    <Input id="certNo" placeholder="LCR-2024-XXXX" className="mt-1.5" />
                                </div>

                                {/* Placeholder for future specific data */}
                                <div>
                                    <Label className="text-xs text-slate-500 uppercase">Transferred From</Label>
                                    <Input placeholder="(If applicable)" className="mt-1.5" disabled />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes" className="text-xs text-slate-500 uppercase">
                                    Official Remarks / Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Enter any additional burial details, officiating priest, or special conditions..."
                                    className="mt-1.5 h-24 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Plot Selection & Summary (1/3 width) */}
                <div className="space-y-6">
                    {/* SECTION C: Plot Assignment */}
                    <Card className="border-slate-800 bg-slate-900 text-slate-50">
                        <CardHeader className="pb-3">
                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                <MapPin className="h-5 w-5" />
                                <span className="text-sm font-semibold tracking-wider uppercase">Burial Location</span>
                            </div>
                            <CardTitle className="text-white">Plot Assignment</CardTitle>
                            <CardDescription className="text-slate-400">Select the designated lot or niche for this interment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border-2 border-dashed border-slate-700 bg-slate-800/50 p-6 text-center">
                                <div className="mb-3 flex justify-center">
                                    <MapPin className="h-10 w-10 text-slate-600" />
                                </div>
                                <p className="mb-4 text-sm text-slate-400">No plot selected yet.</p>
                                <Button variant="secondary" className="w-full">
                                    Select from Map
                                </Button>
                            </div>

                            {/* Example of what it looks like when selected (Hidden for now) */}
                            {/* <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-lg mt-4">
                    <p className="text-xs uppercase text-emerald-400 font-bold">Selected Plot</p>
                    <p className="text-lg font-mono text-white">BLK-A / LOT-102</p>
                    <p className="text-sm text-emerald-200">North Wing • Ground</p>
                </div>
                */}
                        </CardContent>
                        <CardFooter className="border-t border-slate-800 bg-slate-950/30 p-4 text-xs text-slate-500">
                            <AlertCircle className="mr-2 inline h-4 w-4" />
                            Ensure the plot status is "Available" or "Reserved" before assigning.
                        </CardFooter>
                    </Card>

                    {/* Audit / Meta Info */}
                    <Card className="border-none bg-white shadow-none">
                        <CardContent className="pt-6 text-sm text-slate-500">
                            <p className="mb-2">
                                <strong>Processed By:</strong> Admin User
                            </p>
                            <p>
                                <strong>Date:</strong> {new Date().toLocaleDateString()}
                            </p>
                            <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                                <strong>Note:</strong> Once saved, this record requires a supervisor's approval to be deleted.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
