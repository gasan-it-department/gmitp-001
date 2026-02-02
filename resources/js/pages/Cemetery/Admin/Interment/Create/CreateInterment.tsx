import Interments from '@/actions/App/External/Api/Controllers/Cemetery/Interments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/App/AppLayout';
import { useForm } from '@inertiajs/react';
import { FileText, Loader2, Save, User } from 'lucide-react';
import React from 'react';

export default function CreateIntermentForm({ municipality }: any) {
    // 1. Setup Inertia Form Helper
    // The keys here match your 'IntermentRequest' rules exactly.
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        middle_name: '',
        extension_name: '',
        date_of_birth: '',
        date_of_death: '',
        gender: '',
        cause_of_death: '',
        death_certificate_number: '',
        notes: '',
    });

    // 2. Submission Handler
    // This hits your Invokable Controller (RegisterIntermentController)
    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(Interments.RegisterIntermentsController.url(), {
            headers: {
                'X-Municipality-Slug': municipality.slug, // Replace with your actual header key and value
            },
            onSuccess: () => {
                // Success logic
            },
            onError: (errors) => {
                console.error('Submission failed:', errors);
            },
        });
    }

    return (
        <AppLayout>
            <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 p-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">New Interment Record</h2>
                    <p className="text-muted-foreground">Create a pending record. Plot assignment can be done later.</p>
                </div>

                {/* SECTION 1: Identity */}
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <User className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-wider uppercase">Deceased Identity</span>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {/* Row 1: Full Name */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-5">
                                <Label htmlFor="first_name" className="text-xs text-slate-500 uppercase">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value.toUpperCase())}
                                    className="mt-1.5 font-medium uppercase"
                                    placeholder="JUAN"
                                />
                                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                            </div>

                            <div className="col-span-6 md:col-span-2">
                                <Label htmlFor="middle_name" className="text-xs text-slate-500 uppercase">
                                    Middle Name
                                </Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value.toUpperCase())}
                                    className="mt-1.5 font-medium uppercase"
                                    placeholder="A."
                                />
                                {errors.middle_name && <p className="mt-1 text-xs text-red-500">{errors.middle_name}</p>}
                            </div>

                            <div className="col-span-6 md:col-span-5">
                                <Label htmlFor="last_name" className="text-xs text-slate-500 uppercase">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value.toUpperCase())}
                                    className="mt-1.5 font-medium uppercase"
                                    placeholder="DELA CRUZ"
                                />
                                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Row 2: Extension & Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="extension_name" className="text-xs text-slate-500 uppercase">
                                    Extension
                                </Label>
                                <Input
                                    id="extension_name"
                                    placeholder="JR., III"
                                    value={data.extension_name}
                                    onChange={(e) => setData('extension_name', e.target.value.toUpperCase())}
                                    className="mt-1.5 uppercase"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500 uppercase">Gender</Label>
                                <Select onValueChange={(val) => setData('gender', val)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                            </div>
                        </div>

                        {/* Row 3: Vital Dates */}
                        <div className="grid grid-cols-1 gap-4 border-t border-dashed pt-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="dob" className="text-xs text-slate-500 uppercase">
                                    Date of Birth
                                </Label>
                                <Input
                                    type="date"
                                    id="dob"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className="mt-1.5"
                                />
                                {errors.date_of_birth && <p className="mt-1 text-xs text-red-500">{errors.date_of_birth}</p>}
                            </div>
                            <div>
                                <Label htmlFor="dod" className="text-xs text-slate-500 uppercase">
                                    Date of Death
                                </Label>
                                <Input
                                    type="date"
                                    id="dod"
                                    value={data.date_of_death}
                                    onChange={(e) => setData('date_of_death', e.target.value)}
                                    className="mt-1.5 border-slate-300 bg-slate-50"
                                />
                                {/* This specific error field will catch your 'after_or_equal' message from PHP */}
                                {errors.date_of_death && <p className="mt-1 text-xs text-red-500">{errors.date_of_death}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SECTION 2: Official Stats */}
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-wider uppercase">Death Statistics</span>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Label htmlFor="cause" className="text-xs text-slate-500 uppercase">
                                    Cause of Death
                                </Label>
                                <Input
                                    id="cause"
                                    placeholder="e.g. Cardiorespiratory Arrest"
                                    value={data.cause_of_death}
                                    onChange={(e) => setData('cause_of_death', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cert_no" className="text-xs text-slate-500 uppercase">
                                    Death Certificate No.
                                </Label>
                                <Input
                                    id="cert_no"
                                    placeholder="LCR-XXXX-XXXX"
                                    value={data.death_certificate_number}
                                    onChange={(e) => setData('death_certificate_number', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes" className="text-xs text-slate-500 uppercase">
                                Notes / Remarks
                            </Label>
                            <Textarea
                                id="notes"
                                className="mt-1.5 h-24 resize-none"
                                placeholder="Additional details..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Bar */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="w-40">
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save Record
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
