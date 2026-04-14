import ConfirmDialog from '@/components/Shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Category, FundingSource, ProcurementFormData } from '@/Core/Types/Procurement/procurement';
import { AwardInformation } from '@/pages/PublicInformation/Admin/Procurement/Create/Components/AwardInformation';
import { BudgetAndSchedule } from '@/pages/PublicInformation/Admin/Procurement/Create/Components/BudgetAndSchedule';
import { ProjectDetails } from '@/pages/PublicInformation/Admin/Procurement/Create/Components/ProjectDetails';
import procurement from '@/routes/procurement';
import { router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FilePlus2, Gavel, Info, StickyNote, Wallet } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Textarea } from '../ui/textarea';

interface SharedFormProps {
    initialData: ProcurementFormData;
    mode: 'create' | 'edit';
    procurementId?: string | number; // Only needed for edit
    fundingSources: FundingSource[];
    categories: Category[];
    statuses: any;
}

export default function SharedProcurementForm({ initialData, mode, procurementId, fundingSources, categories, statuses }: SharedFormProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // 1. Initialize form with whatever data the parent gave us
    const { data, setData, submit, processing, errors, isDirty } = useForm<ProcurementFormData>(initialData);

    const handleInitialSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const onSubmit = () => {
        // 2. SMART ROUTING: Post if create, Put if edit
        const submitMethod = mode === 'create' ? 'post' : 'put';
        const submitUrl = mode === 'create' ? procurement.store.url() : procurement.update.url(procurementId!); // Assuming you have an update route

        submit(submitMethod, submitUrl, {
            forceFormData: mode === 'create', // Usually true for post, false for put
            headers: { 'X-Municipality-Slug': currentMunicipality?.slug || '' },
            onSuccess: () => setIsConfirmOpen(false),
            onError: () => setIsConfirmOpen(false),
        });
    };

    const handleCancel = () => {
        if (isDirty) setIsCancel(true);
        else handleBack();
    };

    const handleBack = () => {
        if (window.history.length > 1) window.history.back();
        else router.visit(procurement.admin.page.url(currentMunicipality.slug));
    };

    const isAwarded = data.status?.toUpperCase() === 'AWARDED';
    const isHistorical = data.is_historical;

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
            {/* --- STICKY HEADER --- */}
            <header className="sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancel}
                            className="hidden shrink-0 rounded-full hover:bg-slate-100 sm:flex"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                        <Separator orientation="vertical" className="hidden h-8 sm:block" />

                        <div>
                            <div className="flex items-center gap-2 lg:gap-3">
                                {/* 3. DYNAMIC TITLE */}
                                <h1 className="line-clamp-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                                    {mode === 'create' ? 'Create Procurement' : `Edit Draft: ${data.title}`}
                                </h1>
                                <Badge
                                    variant={isAwarded ? 'default' : 'outline'}
                                    className={isAwarded ? 'shrink-0 bg-emerald-600 hover:bg-emerald-600' : 'shrink-0'}
                                >
                                    {data.status || 'Draft'}
                                </Badge>
                            </div>
                            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                                {currentMunicipality?.name || 'Municipality'} Portal
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <Button type="button" variant="ghost" onClick={handleCancel} disabled={processing} className="hidden sm:inline-flex">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInitialSubmit}
                            disabled={processing}
                            className="bg-blue-600 px-4 font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 sm:px-6"
                        >
                            {processing ? 'Saving...' : mode === 'create' ? 'Save Draft' : 'Update Draft'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT (Identical to your original code) --- */}
            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <form onSubmit={onSubmit} className="w-full">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* LEFT COLUMN: PRIMARY DATA */}
                            <div className="space-y-8 lg:col-span-8">
                                {/* 1. Project Details */}
                                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 border-b bg-slate-50/50 px-6 py-5 sm:px-8">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                                            <FilePlus2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Project Identification</h3>
                                            <p className="text-sm text-slate-500">Essential reference numbers and categorization.</p>
                                        </div>
                                    </div>
                                    <div className="p-6 sm:p-8">
                                        <ProjectDetails
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                            processing={processing}
                                            fundingSources={fundingSources}
                                            statuses={statuses}
                                            categories={categories}
                                            isHistorical={data.is_historical}
                                        />
                                    </div>
                                </section>

                                {/* 2. Financials */}
                                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 border-b bg-slate-50/50 px-6 py-5 sm:px-8">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Financials & Timeline</h3>
                                            <p className="text-sm text-slate-500">Approved budget and key bidding milestones.</p>
                                        </div>
                                    </div>
                                    <div className="p-6 sm:p-8">
                                        <BudgetAndSchedule data={data} setData={setData} errors={errors} processing={processing} />
                                    </div>
                                </section>

                                {/* 3. Award Information (CONDITIONAL) */}
                                {isAwarded ? (
                                    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm duration-500 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex items-center gap-4 border-b bg-emerald-50/50 px-6 py-5 sm:px-8">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                                                <Gavel className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Award Details</h3>
                                                <p className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                                                    <CheckCircle2 className="h-3 w-3" /> Project status is set to Awarded
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 sm:p-8">
                                            <AwardInformation data={data} setData={setData} errors={errors} processing={processing} />
                                        </div>
                                    </section>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center transition-all sm:p-10">
                                        <Gavel className="mx-auto mb-3 h-10 w-10 text-slate-300 opacity-50" />
                                        <h4 className="text-lg font-bold text-slate-900">Award Details are Locked</h4>
                                        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                                            This section becomes available when the project status is updated to{' '}
                                            <span className="font-bold text-blue-600">AWARDED</span>.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: SIDEBAR */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-28 space-y-6">
                                    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                                        <div className="flex items-center gap-3 border-b bg-slate-50/50 px-6 py-4">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white shadow-sm">
                                                <StickyNote className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-bold text-slate-900">
                                                Notes <span className="text-red-500">/</span> Remarks
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <Textarea
                                                value={data.notes ?? ''}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Add any additional notes, BAC resolutions, or remarks regarding this procurement here..."
                                                className="min-h-[120px] resize-y"
                                            />
                                            {errors.notes && <span className="mt-2 block text-sm font-medium text-red-500">{errors.notes}</span>}
                                        </div>
                                    </section>

                                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                                        <div className="flex items-start gap-3 text-blue-700">
                                            <div className="shrink-0 rounded-full bg-blue-100 p-1.5">
                                                <Info className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold">Portal Guidelines</p>
                                                <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed opacity-80">
                                                    <li>PhilGEPS reference is required for public biddings.</li>
                                                    <li>All monetary values must be in PHP.</li>
                                                    <li>Attachments are visible to the public.</li>
                                                    <li>Closing dates must be set in the future.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>{' '}
            </main>

            {/* --- DIALOGS (Dynamic messaging based on mode) --- */}
            <ConfirmDialog
                title={mode === 'create' ? 'Save Procurement?' : 'Update Procurement?'}
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText={mode === 'create' ? 'Yes, Save Draft' : 'Yes, Update Draft'}
                onConfirm={onSubmit}
                isProcessing={processing}
                message={mode === 'create' ? 'Are you sure you want to save this project?' : 'Are you sure you want to update these details?'}
            />

            <ConfirmDialog
                title="Discard unsaved changes?"
                isOpen={isCancel}
                onCancel={() => setIsCancel(false)}
                confirmText="Discard Changes"
                onConfirm={handleBack}
                isProcessing={processing}
                variant="destructive"
                message="Are you sure you want to cancel? Any unsaved changes will be lost."
            />
        </div>
    );
}
