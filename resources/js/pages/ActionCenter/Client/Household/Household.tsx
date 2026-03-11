import { CheckCircle, ChevronLeft, ChevronRight, MapPin, Plus, Upload, User } from 'lucide-react';
import { useState } from 'react';

// --- 1. TYPES & INTERFACES ---
interface HouseholdMember {
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    age: number;
    barangay: string;
    purok?: string;
    relationship: string;
}

interface RequestForm {
    beneficiary_id: string;
    household_ids: string[];
    category: string;
    amount: string;
    details: string;
    files_id: boolean; // Mocking file upload status
    files_indigency: boolean;
}

// --- 2. MOCK DATA ---
const INITIAL_MEMBERS: HouseholdMember[] = [
    {
        id: '1',
        first_name: 'Juan',
        last_name: 'Cruz',
        birth_date: '1985-05-20',
        age: 40,
        barangay: 'Poblacion',
        purok: 'Zone 1',
        relationship: 'Self',
    },
    {
        id: '2',
        first_name: 'Maria',
        last_name: 'Cruz',
        birth_date: '1988-08-15',
        age: 37,
        barangay: 'Poblacion',
        purok: 'Zone 1',
        relationship: 'Wife',
    },
    {
        id: '3',
        first_name: 'Jose',
        last_name: 'Cruz',
        birth_date: '2010-02-10',
        age: 14,
        barangay: 'Poblacion',
        purok: 'Zone 1',
        relationship: 'Son',
    },
];

const CATEGORIES = ['Medical Assistance', 'Burial Assistance', 'Educational Assistance', 'Financial Aid', 'Fire Victim'];

// --- 3. MAIN COMPONENT ---
export default function CreateRequestMock() {
    // Global State
    const [step, setStep] = useState(1);
    const [members, setMembers] = useState<HouseholdMember[]>(INITIAL_MEMBERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Form State
    const [form, setForm] = useState<RequestForm>({
        beneficiary_id: '',
        household_ids: [],
        category: 'Medical Assistance',
        amount: '',
        details: '',
        files_id: false,
        files_indigency: false,
    });

    // Helpers
    const selectedBeneficiary = members.find((m) => m.id === form.beneficiary_id);

    // Handlers
    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleAddMember = (newMember: HouseholdMember) => {
        setMembers([...members, newMember]);
        // Auto-select the new person if we are on step 1
        if (step === 1 && !form.beneficiary_id) {
            setForm({ ...form, beneficiary_id: newMember.id });
        }
        setIsModalOpen(false);
    };

    const handleSubmit = () => {
        // Simulate API call
        setTimeout(() => setIsSubmitted(true), 1500);
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl duration-500 animate-in fade-in zoom-in">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Request Submitted!</h2>
                    <p className="mt-2 text-gray-500">
                        Your request for <span className="font-semibold text-gray-700">{selectedBeneficiary?.first_name}</span> has been received.
                        Reference ID: <span className="font-mono text-blue-600">REQ-2026-001</span>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 w-full rounded-lg bg-gray-900 py-3 text-white transition hover:bg-gray-800"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-10 font-sans">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">New Assistance Request</h1>
                    <p className="text-gray-500">Department of Social Welfare & Development - Mun. of Gasan</p>
                </div>

                {/* Stepper UI */}
                <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 px-10 shadow-sm">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                    step === s
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                        : step > s
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-100 text-gray-400'
                                } `}
                            >
                                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                            </div>
                            {/* Line connector */}
                            {s !== 4 && (
                                <div
                                    className={`mx-4 h-1 w-20 rounded-full transition-all duration-500 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* --- MAIN FORM CARD --- */}
                <div className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                    {/* Content Area */}
                    <div className="flex-1 p-8">
                        {/* STEP 1: BENEFICIARY */}
                        {step === 1 && (
                            <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Who needs assistance?</h2>

                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Select Beneficiary</label>
                                    <select
                                        value={form.beneficiary_id}
                                        onChange={(e) => setForm({ ...form, beneficiary_id: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Choose from Household --</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.first_name} {m.last_name} ({m.relationship})
                                            </option>
                                        ))}
                                    </select>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-4 text-sm text-gray-500">or</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-gray-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span>Register New Person (Neighbor/Relative)</span>
                                    </button>

                                    {/* Preview Card */}
                                    {selectedBeneficiary && (
                                        <div className="mt-6 flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 duration-200 animate-in zoom-in-95">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-lg font-bold text-blue-700">
                                                {selectedBeneficiary.first_name[0]}
                                                {selectedBeneficiary.last_name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {selectedBeneficiary.first_name} {selectedBeneficiary.last_name}
                                                </h3>
                                                <div className="mt-1 flex gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" /> {selectedBeneficiary.age} yrs old
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {selectedBeneficiary.barangay}
                                                    </span>
                                                </div>
                                                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                                                    <CheckCircle className="h-3 w-3" /> Identity Verified
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: HOUSEHOLD COMPOSITION */}
                        {step === 2 && (
                            <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                                <h2 className="mb-2 text-xl font-bold text-gray-900">Household Composition</h2>
                                <p className="mb-6 text-sm text-gray-500">
                                    Who else lives with {selectedBeneficiary?.first_name}? This helps us evaluate financial status.
                                </p>

                                <div className="space-y-3">
                                    {members
                                        .filter((m) => m.id !== form.beneficiary_id) // Don't show the beneficiary
                                        .map((m) => (
                                            <label
                                                key={m.id}
                                                className={`flex cursor-pointer items-center rounded-xl border p-4 transition-all ${form.household_ids.includes(m.id) ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'} `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.household_ids.includes(m.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setForm({ ...form, household_ids: [...form.household_ids, m.id] });
                                                        else setForm({ ...form, household_ids: form.household_ids.filter((id) => id !== m.id) });
                                                    }}
                                                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="ml-4">
                                                    <span className="block font-medium text-gray-900">
                                                        {m.first_name} {m.last_name}
                                                    </span>
                                                    <span className="block text-xs text-gray-500">
                                                        {m.relationship} • {m.age} years old
                                                    </span>
                                                </div>
                                            </label>
                                        ))}

                                    {members.filter((m) => m.id !== form.beneficiary_id).length === 0 && (
                                        <div className="rounded-lg bg-gray-50 py-8 text-center text-gray-500">
                                            No other family members found.
                                            <button onClick={() => setIsModalOpen(true)} className="ml-2 text-blue-600 hover:underline">
                                                Add Member
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DETAILS */}
                        {step === 3 && (
                            <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Assistance Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Amount Requested (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute top-3 left-3 text-gray-500">₱</span>
                                        <input
                                            type="number"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-gray-300 p-3 pl-8 outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Reason / Details</label>
                                    <textarea
                                        rows={4}
                                        value={form.details}
                                        onChange={(e) => setForm({ ...form, details: e.target.value })}
                                        placeholder="Describe the situation (e.g., patient diagnosis, hospital details, specific needs)..."
                                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: UPLOAD & REVIEW */}
                        {step === 4 && (
                            <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Review & Documents</h2>

                                {/* Document Upload Simulation */}
                                <div className="mb-8 grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Valid ID (Beneficiary)', key: 'files_id' as const },
                                        { label: 'Barangay Indigency', key: 'files_indigency' as const },
                                    ].map((file) => (
                                        <div
                                            key={file.key}
                                            className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${form[file.key] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}
                                        >
                                            {form[file.key] ? (
                                                <div className="flex flex-col items-center text-green-700">
                                                    <CheckCircle className="mb-2 h-8 w-8" />
                                                    <span className="text-sm font-bold">Uploaded</span>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex cursor-pointer flex-col items-center text-gray-500"
                                                    onClick={() => setForm({ ...form, [file.key]: true })}
                                                >
                                                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                                    <span className="text-sm font-medium">{file.label}</span>
                                                    <span className="mt-1 text-xs text-gray-400">Click to simulate upload</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Summary Card */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900 uppercase">Application Summary</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Beneficiary</span>
                                            <span className="font-medium text-gray-900">
                                                {selectedBeneficiary?.first_name} {selectedBeneficiary?.last_name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Address</span>
                                            <span className="font-medium text-gray-900">
                                                {selectedBeneficiary?.barangay}, {selectedBeneficiary?.purok}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Type</span>
                                            <span className="font-medium text-blue-600">{form.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Household Members</span>
                                            <span className="font-medium text-gray-900">{form.household_ids.length} included</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200"
                            >
                                <ChevronLeft className="h-4 w-4" /> Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                disabled={step === 1 && !form.beneficiary_id}
                                className="flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-2.5 font-medium text-white shadow-lg shadow-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next Step <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!form.files_id || !form.files_indigency}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                Submit Application
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MOCK MODAL: Add New Person --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200 animate-in fade-in">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="font-bold text-gray-900">Add Household Member</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form
                            className="space-y-4 p-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                // Create Mock Person
                                const formData = new FormData(e.currentTarget);
                                handleAddMember({
                                    id: Math.random().toString(),
                                    first_name: formData.get('first_name') as string,
                                    last_name: formData.get('last_name') as string,
                                    relationship: formData.get('relationship') as string,
                                    barangay: formData.get('barangay') as string,
                                    purok: formData.get('purok') as string,
                                    birth_date: '1990-01-01',
                                    age: 35,
                                });
                            }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                                    <input name="first_name" required className="mt-1 w-full rounded-lg border p-2" placeholder="Pedro" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                                    <input name="last_name" required className="mt-1 w-full rounded-lg border p-2" placeholder="Santos" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Relationship to You</label>
                                <select name="relationship" className="mt-1 w-full rounded-lg border p-2">
                                    <option>Neighbor</option>
                                    <option>Relative</option>
                                    <option>Friend</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Barangay</label>
                                    <select name="barangay" className="mt-1 w-full rounded-lg border p-2">
                                        <option>Poblacion</option>
                                        <option>Bachao</option>
                                        <option>Lipata</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Purok</label>
                                    <input name="purok" className="mt-1 w-full rounded-lg border p-2" placeholder="Zone 1" />
                                </div>
                            </div>

                            <button type="submit" className="mt-2 w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">
                                Save & Select Person
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
