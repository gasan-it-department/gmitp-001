import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// MOCK DATA: Replace this with your actual 'reports' prop from the Resource
const mockRequests = [
    {
        id: 1,
        reference_code: 'MED-2025-0841',
        category: 'Medical Assistance',
        beneficiary_name: 'Juan Dela Cruz',
        status: 'Pending', // pending, approved, rejected, released
        created_at: 'Dec 30, 2025',
        description: 'Assistance for dialysis treatment sessions.',
    },
    {
        id: 2,
        reference_code: 'FIN-2025-0112',
        category: 'Financial Aid',
        beneficiary_name: 'Maria Clara',
        status: 'Approved',
        created_at: 'Dec 15, 2025',
        description: 'Educational assistance for college tuition.',
    },
    {
        id: 3,
        reference_code: 'BUR-2025-0033',
        category: 'Burial Assistance',
        beneficiary_name: 'Jose Rizal',
        status: 'Released',
        created_at: 'Nov 01, 2025',
        description: 'Assistance for funeral expenses.',
    },
];

export default function AssistanceList({ assistance }: any) {
    console.log(assistance);
    // Add props here later like { requests }
    const [activeTab, setActiveTab] = useState('All');

    // Simple status badge helper
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'released':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Pending
        }
    };

    return (
        <PublicLayout title="" description="">
            <Head title="My Assistance Requests" />

            {/* HEADER SECTION */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Action Center</h1>
                            <p className="mt-1 text-sm text-gray-500">Track the status of your assistance applications.</p>
                        </div>
                        <Link
                            href="/assistance/create" // Adjust your route
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase shadow-sm transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none active:bg-indigo-900"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Request
                        </Link>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="mt-8 w-full px-4 sm:px-6 lg:px-8">
                {/* TABS (Optional) */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {['All', 'Pending', 'History'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } `}
                            >
                                {tab} Requests
                            </button>
                        ))}
                    </nav>
                </div>

                {/* REQUEST LIST */}
                <div className="space-y-4">
                    {mockRequests.map((req) => (
                        <div
                            key={req.id}
                            className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    {/* Left Side: Info */}
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            <span className="font-mono text-xs text-gray-400">#{req.reference_code}</span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900">{req.category}</h3>

                                        <div className="mt-1 text-sm text-gray-600">
                                            Beneficiary: <span className="font-medium text-gray-900">{req.beneficiary_name}</span>
                                        </div>

                                        <p className="mt-2 line-clamp-1 text-sm text-gray-500">{req.description}</p>
                                    </div>

                                    {/* Right Side: Date & Arrow */}
                                    <div className="ml-4 flex h-full flex-col items-end justify-between gap-4">
                                        <span className="text-sm text-gray-500">{req.created_at}</span>

                                        <Link
                                            href={`/assistance/${req.id}`}
                                            className="group flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                        >
                                            View Details
                                            <svg
                                                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {mockRequests.length === 0 && (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new assistance request.</p>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
