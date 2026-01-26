import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import BeneficiaryStep from './Components/BeneficiaryStep';
import DetailsStep from './Components/DetailsStep';
import HouseholdStep from './Components/HouseholdStep';

export default function CreateRequest({ members }: any) {
    // 1. Navigation State
    const [currentStep, setCurrentStep] = useState(1);

    // 2. Form Data (One big object for all steps)
    const { data, setData, post, processing, errors } = useForm({
        beneficiary_id: '',
        household_ids: [], // Array of IDs
        category: 'Medical',
        amount: '',
        details: '',
        // files: null (Add later when ready)
    });

    // 3. Final Submission
    const submit = (e) => {
        e.preventDefault();
        post(route('action-center.requests.store'));
    };

    // Helper to check if we can proceed (Basic Client Validation)
    const canProceed = () => {
        if (currentStep === 1 && !data.beneficiary_id) return false;
        if (currentStep === 3 && !data.details) return false;
        return true;
    };

    return (
        <PublicLayout title="Request Assistance" description="Submit a new application">
            <Head title="New Assistance Request" />

            <div className="min-h-screen bg-gray-50 px-4 py-8 font-sans">
                <div className="mx-auto max-w-3xl">
                    {/* TOP: Progress Bar */}
                    <div className="mb-8">
                        <div className="relative flex items-center justify-between">
                            {/* The Gray Line */}
                            <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 transform bg-gray-200" />

                            {[1, 2, 3].map((step) => (
                                <div key={step} className={`flex flex-col items-center bg-gray-50 px-2`}>
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 text-sm font-bold transition-all duration-300 ${
                                            currentStep >= step
                                                ? 'border-blue-100 bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'border-gray-200 bg-white text-gray-400'
                                        } `}
                                    >
                                        {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-bold tracking-wide uppercase ${currentStep >= step ? 'text-blue-700' : 'text-gray-400'}`}
                                    >
                                        {step === 1 ? 'Beneficiary' : step === 2 ? 'Household' : 'Details'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CARD */}
                    <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200">
                        {/* Dynamic Step Content */}
                        <div className="min-h-[400px] p-6 md:p-8">
                            {currentStep === 1 && (
                                <BeneficiaryStep members={members} value={data.beneficiary_id} onChange={(id) => setData('beneficiary_id', id)} />
                            )}

                            {currentStep === 2 && (
                                <HouseholdStep
                                    members={members}
                                    beneficiaryId={data.beneficiary_id} // To filter out the beneficiary himself
                                    selectedIds={data.household_ids}
                                    onToggle={(id) => {
                                        const newIds = data.household_ids.includes(id)
                                            ? data.household_ids.filter((x) => x !== id)
                                            : [...data.household_ids, id];
                                        setData('household_ids', newIds);
                                    }}
                                />
                            )}

                            {currentStep === 3 && <DetailsStep data={data} setData={setData} errors={errors} />}
                        </div>

                        {/* FOOTER: Navigation Buttons */}
                        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-8 py-5">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep((s) => s - 1)}
                                    className="flex items-center font-bold text-gray-600 transition hover:text-gray-900"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    disabled={!canProceed()}
                                    onClick={() => setCurrentStep((s) => s + 1)}
                                    className="flex items-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing || !canProceed()}
                                    className="flex items-center rounded-xl bg-green-600 px-8 py-3 font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
