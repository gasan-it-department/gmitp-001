import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProcurementFormData } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import AppLayout from '@/layouts/App/AppLayout';
import procurement from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FilePlus2, Gavel, Paperclip, Wallet } from 'lucide-react';
import { Attachments } from './Components/Attachments';
import { AwardInformation } from './Components/AwardInformation';
import { BudgetAndSchedule } from './Components/BudgetAndSchedule';
import { ProjectDetails } from './Components/ProjectDetails';

const initialValues: ProcurementFormData = {
    reference_number: '',
    title: '',
    category: '',
    status: 'OPEN',
    approved_budget: 0,
    contract_amount: null,
    pre_bid_date: null,
    closing_date: null,
    award_date: null,
    winning_bidder: null,
    attachments: [],
};

export default function CreateProcurement() {
    const { currentMunicipality } = usePage<any>().props;

    // Explicitly typing the useForm hook helps resolve 'never' errors
    const { data, setData, post, processing, errors } = useForm<ProcurementFormData>(initialValues);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(procurement.store.url(), {
            forceFormData: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality?.slug || '',
            },
        });
    };

    const handleBack = () => window.history.back();

    const isAwarded = data.status?.toUpperCase() === 'AWARDED';

    return (
        <AppLayout>
            <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
                {/* --- STICKY HEADER --- */}
                <header className="sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between px-6 py-4 lg:px-10">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </Button>
                            <Separator orientation="vertical" className="h-8" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Create Procurement</h1>
                                    <Badge
                                        variant={isAwarded ? 'default' : 'outline'}
                                        className={isAwarded ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
                                    >
                                        {data.status}
                                    </Badge>
                                </div>
                                <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                                    {currentMunicipality?.name || 'Municipality'} Portal
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" onClick={handleBack} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                onClick={onSubmit}
                                disabled={processing}
                                className="bg-blue-600 px-6 font-bold shadow-lg shadow-blue-200 hover:bg-blue-700"
                            >
                                {processing ? 'Publishing...' : 'Publish Procurement'}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 px-6 py-8 lg:px-10">
                    <form onSubmit={onSubmit} className="mx-auto w-full">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* LEFT COLUMN: PRIMARY DATA */}
                            <div className="space-y-8 lg:col-span-8">
                                {/* 1. Project Details */}
                                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 border-b bg-slate-50/50 px-8 py-5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                                            <FilePlus2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Project Identification</h3>
                                            <p className="text-sm text-slate-500">Essential reference numbers and categorization.</p>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <ProjectDetails data={data} setData={setData} errors={errors} processing={processing} />
                                    </div>
                                </section>

                                {/* 2. Financials */}
                                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 border-b bg-slate-50/50 px-8 py-5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Financials & Timeline</h3>
                                            <p className="text-sm text-slate-500">Approved budget and key bidding milestones.</p>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <BudgetAndSchedule data={data} setData={setData} errors={errors} processing={processing} />
                                    </div>
                                </section>

                                {/* 3. Award Information (CONDITIONAL) */}
                                {isAwarded ? (
                                    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm duration-500 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex items-center gap-4 border-b bg-emerald-50/50 px-8 py-5">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                                                <Gavel className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Award Details</h3>
                                                <p className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                                                    <CheckCircle2 className="h-3 w-3" /> Project status is set to Awarded
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <AwardInformation data={data} setData={setData} errors={errors} processing={processing} />
                                        </div>
                                    </section>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-10 text-center transition-all">
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
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-sm">
                                                <Paperclip className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-bold text-slate-900">Attachments</h3>
                                        </div>
                                        <div className="p-6">
                                            <Attachments
                                                attachments={data.attachments}
                                                // FIXED: Using function pattern to avoid TypeScript 'never' error
                                                onFilesChange={(newFiles) => setData((prev) => ({ ...prev, attachments: newFiles }))}
                                                error={(errors as any)?.attachments}
                                                disabled={processing}
                                            />

                                            {/* File Error Display */}
                                            <div className="mt-4 space-y-1">
                                                {Object.keys(errors).map((key) => {
                                                    if (key.startsWith('attachments.')) {
                                                        return (
                                                            <div
                                                                key={key}
                                                                className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs font-semibold text-red-600"
                                                            >
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                                                {(errors as any)[key]}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    </section>

                                    {/* <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                                        <div className="flex items-start gap-3 text-blue-700">
                                            <div className="rounded-full bg-blue-100 p-1">
                                                <Info className="h-4 w-4 shrink-0" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold">Portal Guidelines</p>
                                                <ul className="list-inside list-disc space-y-1.5 text-xs opacity-80 leading-relaxed">
                                                    <li>PhilGEPS reference is required for public biddings.</li>
                                                    <li>All monetary values must be in PHP.</li>
                                                    <li>Attachments are visible to the public.</li>
                                                    <li>Closing dates must be set in the future.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </AppLayout>
    );
}
