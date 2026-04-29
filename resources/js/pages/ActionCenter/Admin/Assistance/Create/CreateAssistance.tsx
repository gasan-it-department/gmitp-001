import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

// --- Mock Data (Usually passed as props from Laravel Controller) ---
const mockBarangays = ['Antipolo', 'Bacong-Bacong', 'Dawis', 'Pinggan', 'Tres Reyes'];
const mockAssistanceTypes = [
    { id: 1, name: 'Medical Assistance' },
    { id: 2, name: 'Burial Assistance' },
    { id: 3, name: 'Educational Assistance' },
];

export default function CreateAssistanceRequest(assistanceType: any) {
    console.log(assistanceType);
    // Inertia's useForm hook maps exactly to the payload your Controller expects
    const { data, setData, post, processing, errors } = useForm({
        // 1. Household / Address Data
        province: 'MARINDUQUE',
        municipality: 'GASAN',
        barangay: '',
        street_or_purok: '',

        // 2. Beneficiary Data
        first_name: '',
        last_name: '',
        middle_name: '',
        birth_date: '',

        // 3. Request Data
        assistance_type_id: '',
        description: '',
        documents: null as FileList | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        // This will hit your ActionCenterController@store method
        post(route('action-center.requests.store'));
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <Head title="Request Assistance" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Request Public Assistance</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Fill out the form below to request financial or material assistance. Please ensure all details match the attached valid IDs.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- SECTION 1: THE HOUSEHOLD (Address) --- */}
                {/* Why first? Because this establishes the Household for the 3-month cooldown check. */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <h2 className="text-lg leading-7 font-semibold text-gray-900">1. Current Address</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Where does the beneficiary currently reside?</p>

                        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Municipality</label>
                                <input
                                    type="text"
                                    disabled
                                    value={data.municipality}
                                    className="mt-2 block w-full cursor-not-allowed rounded-md border-0 bg-gray-100 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Barangay</label>
                                <select
                                    value={data.barangay}
                                    onChange={(e) => setData('barangay', e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                >
                                    <option value="">Select Barangay</option>
                                    {mockBarangays.map((brgy) => (
                                        <option key={brgy} value={brgy.toUpperCase()}>
                                            {brgy}
                                        </option>
                                    ))}
                                </select>
                                {errors.barangay && <p className="mt-2 text-sm text-red-600">{errors.barangay}</p>}
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Street / Purok</label>
                                <input
                                    type="text"
                                    value={data.street_or_purok}
                                    onChange={(e) => setData('street_or_purok', e.target.value)}
                                    placeholder="e.g., Purok 1"
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: THE BENEFICIARY (Identity) --- */}
                {/* Separate from the submitter. The backend uses this to firstOrCreate the record. */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <h2 className="text-lg leading-7 font-semibold text-gray-900">2. Beneficiary Details</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Who is the primary recipient of this assistance?</p>

                        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm leading-6 font-medium text-gray-900">First Name</label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 uppercase shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                />
                                {errors.first_name && <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Middle Name</label>
                                <input
                                    type="text"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 uppercase shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Last Name</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 uppercase shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                />
                                {errors.last_name && <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>}
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Birth Date</label>
                                <input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                />
                                {errors.birth_date && <p className="mt-2 text-sm text-red-600">{errors.birth_date}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 3: THE REQUEST (Transaction) --- */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <h2 className="text-lg leading-7 font-semibold text-gray-900">3. Assistance Required</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Provide details and attach necessary proof.</p>

                        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Assistance Type</label>
                                <select
                                    value={data.assistance_type_id}
                                    onChange={(e) => setData('assistance_type_id', e.target.value)}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                >
                                    <option value="">Select an option</option>
                                    {mockAssistanceTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.assistance_type_id && <p className="mt-2 text-sm text-red-600">{errors.assistance_type_id}</p>}
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm leading-6 font-medium text-gray-900">Brief Description</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Explain the situation briefly..."
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm leading-6 font-medium text-gray-900">
                                    Upload Documents (Valid ID, Medical Cert, etc.)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setData('documents', e.target.files)}
                                    className="mt-2 block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6">
                    <button type="button" className="text-sm leading-6 font-semibold text-gray-900">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {processing ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
