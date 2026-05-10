import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Banknote, CalendarClock, CheckCircle2, FileText, Info, ShieldCheck, Upload, User, Users } from 'lucide-react';

// UI Components (Assuming Shadcn/Custom)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/Public/PublicLayout';

interface DocumentRequirement {
    id: string;
    name: string;
    is_required: boolean;
}

interface Beneficiary {
    id: string;
    first_name: string;
    last_name: string;
    relationship: string;
}

interface Props {
    assistanceType?: {
        id: string;
        name: string;
        description: string;
        max_amount: number | string;
        cooldown_months: number;
        documents: DocumentRequirement[];
    };
    beneficiaries?: Beneficiary[];
}

// --- MOCK DATA FOR UI TESTING ---
const MOCK_ASSISTANCE_TYPE = {
    id: 'mock-medical-001',
    name: 'Medical Assistance',
    description:
        'Ang medical assistance o tulong medikal ay isang uri ng serbisyo o pondong ibinibigay ng pamahalaan upang matulungan ang mga mamamayan sa kanilang mga gastusing pangkalusugan. Saklaw nito ang pagbabayad sa mga bayarin sa ospital at pagbili ng mga iniresetang gamot.',
    max_amount: 10000,
    cooldown_months: 3,
    documents: [
        {
            id: 'doc-med-cert',
            name: 'Medical Certificate or Clinical Abstract',
            is_required: true,
        },
        {
            id: 'doc-brgy-indigency',
            name: 'Certificate of Indigency (Barangay)',
            is_required: true,
        },
        {
            id: 'doc-hospital-bill',
            name: 'Hospital Bill or Quotation of Medicines',
            is_required: true,
        },
        {
            id: 'doc-valid-id-rep',
            name: 'Valid ID of Representative',
            is_required: false,
        },
    ],
};

const MOCK_BENEFICIARIES_LIST = [
    {
        id: 'ben-001',
        first_name: 'Maria',
        last_name: 'Dela Cruz',
        relationship: 'Mother',
    },
    {
        id: 'ben-002',
        first_name: 'Juanito',
        last_name: 'Dela Cruz',
        relationship: 'Son',
    },
    {
        id: 'ben-003',
        first_name: 'Roberto',
        last_name: 'Santos',
        relationship: 'Spouse',
    },
];
// --------------------------------

export default function ApplyAssistance({ assistanceType = MOCK_ASSISTANCE_TYPE, beneficiaries = MOCK_BENEFICIARIES_LIST }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        is_for_self: 'true',
        beneficiary_id: '',
        requested_amount: '',
        reason: '',
        documents: {} as Record<string, File | null>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('public.assistance.store', { typeId: assistanceType.id }), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout description="" title="">
            <div className="min-h-screen bg-[#F8FAFC] pb-24">
                {/* --- TOP BREADCRUMB / NAV --- */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-6xl px-4 py-4">
                        <Link className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-primary">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Services
                        </Link>
                    </div>
                </div>

                <div className="container mx-auto mt-8 max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* --- LEFT COLUMN: POLICY & REQUIREMENTS --- */}
                        <div className="space-y-6 lg:col-span-4">
                            <div className="rounded-3xl bg-[#005088] p-8 text-white shadow-xl shadow-blue-900/10">
                                <h1 className="text-2xl leading-tight font-bold tracking-tight uppercase">{assistanceType.name}</h1>
                                <p className="mt-4 text-sm leading-relaxed text-blue-100 opacity-90">{assistanceType.description}</p>

                                <div className="mt-8 space-y-4">
                                    {Number(assistanceType.max_amount) > 0 && (
                                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
                                                <Banknote className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">Allocated Cap</p>
                                                <p className="text-lg font-bold">₱{Number(assistanceType.max_amount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    {assistanceType.cooldown_months > 0 && (
                                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
                                                <CalendarClock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">Cooldown Period</p>
                                                <p className="text-lg font-bold">{assistanceType.cooldown_months} Months</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-slate-800 uppercase">
                                    <ShieldCheck className="h-4 w-4 text-[#005088]" /> Checkbox Checklist
                                </h3>
                                <div className="space-y-3">
                                    {assistanceType.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-3 text-sm text-slate-600">
                                            <div className={`h-2 w-2 rounded-full ${doc.is_required ? 'bg-orange-500' : 'bg-slate-300'}`} />
                                            <span>{doc.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: THE FORM --- */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* SECTION 1: BENEFICIARY SELECTION */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Sino ang makakatanggap?</h2>
                                    </div>

                                    <RadioGroup
                                        defaultValue="true"
                                        onValueChange={(val) => setData('is_for_self', val)}
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                    >
                                        <Label
                                            htmlFor="self"
                                            className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${data.is_for_self === 'true' ? 'border-[#005088] bg-blue-50/50' : 'border-slate-100 bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value="true" id="self" />
                                                <span className="font-bold text-slate-700">Para sa sarili</span>
                                            </div>
                                            <User className={`h-5 w-5 ${data.is_for_self === 'true' ? 'text-[#005088]' : 'text-slate-400'}`} />
                                        </Label>

                                        <Label
                                            htmlFor="family"
                                            className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${data.is_for_self === 'false' ? 'border-[#005088] bg-blue-50/50' : 'border-slate-100 bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value="false" id="family" />
                                                <span className="font-bold text-slate-700">Para sa kapamilya</span>
                                            </div>
                                            <Users className={`h-5 w-5 ${data.is_for_self === 'false' ? 'text-[#005088]' : 'text-slate-400'}`} />
                                        </Label>
                                    </RadioGroup>

                                    {data.is_for_self === 'false' && (
                                        <div className="mt-6 duration-300 animate-in fade-in zoom-in-95">
                                            <Label className="ml-1 text-xs font-bold text-slate-500 uppercase">
                                                Pumili sa listahan ng Beneficiaries
                                            </Label>
                                            <Select onValueChange={(val) => setData('beneficiary_id', val)}>
                                                <SelectTrigger className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50">
                                                    <SelectValue placeholder="Pumili ng pangalan..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {beneficiaries.map((b) => (
                                                        <SelectItem key={b.id} value={b.id}>
                                                            {b.first_name} {b.last_name} ({b.relationship})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.beneficiary_id && (
                                                <p className="mt-2 text-xs font-medium text-red-500">{errors.beneficiary_id}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: REQUEST DETAILS */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                            <Banknote className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Detalye ng Kahilingan</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-xs font-bold text-slate-500 uppercase">
                                                Halaga na kailangan (₱)
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400">₱</span>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-8 font-bold"
                                                    placeholder="0.00"
                                                    value={data.requested_amount}
                                                    onChange={(e) => setData('requested_amount', e.target.value)}
                                                />
                                            </div>
                                            {errors.requested_amount && <p className="text-xs font-medium text-red-500">{errors.requested_amount}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reason" className="text-xs font-bold text-slate-500 uppercase">
                                                Dahilan o Sitwasyon
                                            </Label>
                                            <Textarea
                                                id="reason"
                                                className="min-h-[150px] resize-none rounded-2xl border-slate-200 bg-slate-50 p-4"
                                                placeholder="Ipaliwanag dito kung bakit kailangan ang tulong..."
                                                value={data.reason}
                                                onChange={(e) => setData('reason', e.target.value)}
                                            />
                                            {errors.reason && <p className="text-xs font-medium text-red-500">{errors.reason}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: DOCUMENT UPLOADS */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#005088]">
                                            <Upload className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Upload ng mga Dokumento</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {assistanceType.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="group relative rounded-2xl border-2 border-dashed border-slate-200 p-6 transition-all hover:border-[#005088] hover:bg-blue-50/30"
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#005088] group-hover:text-white">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <p className="mt-3 line-clamp-1 text-sm font-bold text-slate-700">{doc.name}</p>
                                                    <p className="mt-1 text-[10px] font-black tracking-tighter text-slate-400 uppercase">
                                                        {doc.is_required ? 'Required (Mandatory)' : 'Optional'}
                                                    </p>

                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 cursor-pointer opacity-0"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            setData('documents', { ...data.documents, [doc.id]: file });
                                                        }}
                                                    />

                                                    {data.documents[doc.id] && (
                                                        <div className="mt-3 flex items-center gap-1 text-emerald-600 animate-in fade-in">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="text-[10px] font-bold uppercase">File Selected</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DATA PRIVACY NOTICE */}
                                <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6">
                                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                    <p className="text-xs leading-relaxed text-amber-800">
                                        <strong>Data Privacy Notice:</strong> Ang lahat ng impormasyong iyong ibibigay ay gagamitin lamang para sa
                                        pagproseso ng iyong assistance request alinsunod sa <strong>Data Privacy Act of 2012</strong>. Sa pagpindot ng
                                        "Submit Request", ikaw ay sumasang-ayon sa aming mga polisiya.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-16 w-full rounded-2xl bg-[#005088] text-lg font-black tracking-widest text-white uppercase shadow-xl shadow-blue-900/20 transition-all hover:bg-[#003d66] active:scale-[0.98]"
                                >
                                    {processing ? 'Ipinapadala...' : 'I-Submit ang Request'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
