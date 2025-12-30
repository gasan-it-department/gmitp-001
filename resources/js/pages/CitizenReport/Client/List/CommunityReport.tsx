import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link } from '@inertiajs/react';

// ----------------------------------------------------------------------
// 1. MOCK DATA (Simulating what your Controller will send later)
// ----------------------------------------------------------------------
const MOCK_REPORTS = [
    {
        id: 101,
        type: 'Street Light',
        location: 'Brgy. San Jose, Near Chapel',
        description: ' The light post is blinking and sometimes off at night. Very dark in this area.',
        status: 'pending', // pending, in_progress, resolved, rejected
        date_submitted: 'Dec 28, 2025',
        image_preview: 'https://placehold.co/600x400/e2e8f0/475569?text=Street+Light', // Placeholder
    },
    {
        id: 102,
        type: 'Pothole / Road Damage',
        location: 'Main Highway, Purok 3',
        description: 'Deep hole in the middle of the road, dangerous for motors.',
        status: 'resolved',
        date_submitted: 'Dec 15, 2025',
        image_preview: 'https://placehold.co/600x400/e2e8f0/475569?text=Road+Damage',
    },
    {
        id: 103,
        type: 'Garbage Collection',
        location: 'Public Market Exit',
        description: 'Garbage has not been collected for 3 days.',
        status: 'in_progress',
        date_submitted: 'Dec 29, 2025',
        image_preview: 'https://placehold.co/600x400/e2e8f0/475569?text=Garbage',
    },
];

// ----------------------------------------------------------------------
// 2. HELPER COMPONENTS (For UI Consistency)
// ----------------------------------------------------------------------

// A simple Badge to make status clear for older users (Color + Text)
const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
        resolved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
        pending: 'Waiting for Action',
        in_progress: 'Action in Progress',
        resolved: 'Fixed / Done',
        rejected: 'Declined',
    };

    const currentStyle = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    const label = labels[status as keyof typeof labels] || status;

    return <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${currentStyle}`}>{label}</span>;
};

// ----------------------------------------------------------------------
// 3. MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function CommunityReport({ reports }: { reports: any }) {
    console.log(reports);
    return (
        <PublicLayout title="" description="">
            <Head title="Community Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="min-h-screen overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        {/* 1. The Tabs (Connects this to Assistance Page) */}
                        {/* <ActivityNav /> */}

                        {/* 2. Page Header & Action */}
                        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Community Reports</h3>
                                <p className="mt-1 text-sm text-gray-500">Report damage or issues in your barangay easily.</p>
                            </div>

                            {/* Big, Clear Button for "Generic Age" users */}
                        </div>

                        {/* 3. The Report Cards (Better than tables for mobile/elderly) */}
                        <div className="grid gap-6">
                            {MOCK_REPORTS.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row sm:p-6"
                                >
                                    {/* Image Section */}
                                    <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 sm:w-48">
                                        <img src={report.image_preview} alt={report.type} className="h-full w-full object-cover" />
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <h4 className="text-lg font-bold text-gray-900">{report.type}</h4>
                                                <div>
                                                    <StatusBadge status={report.status} />
                                                </div>
                                            </div>

                                            <p className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    ></path>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    ></path>
                                                </svg>
                                                {report.location}
                                            </p>

                                            <p className="line-clamp-2 text-sm text-gray-500">{report.description}</p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                            <span className="text-xs font-medium text-gray-400">Submitted: {report.date_submitted}</span>

                                            <Link
                                                href="#"
                                                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                            >
                                                View Details &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State (If no reports exist) */}
                        {MOCK_REPORTS.length === 0 && (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
                                <p className="text-lg text-gray-500">You haven't reported any issues yet.</p>
                                <p className="text-sm text-gray-400">See a problem in your area? Let us know!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
