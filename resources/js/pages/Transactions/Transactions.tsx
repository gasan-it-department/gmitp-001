import ListFeedbackController from '@/actions/App/External/Web/Controllers/Feedback/Client/ListFeedbackController';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import actionCenter from '@/routes/actionCenter'; // Assuming this is your route helper
import communityReport from '@/routes/communityReport';
import { Link, usePage } from '@inertiajs/react'; // <--- 1. Import usePage
import { AlertTriangle, ChevronRight, FileWarning, HandHeart, Layers } from 'lucide-react';

type SharedProps = {
    currentMunicipality: {
        id: number;
        slug: string;
        name: string;
    };
};

interface Props {
    counts: {
        assistance: number;
        reports: number;
    };
}

export default function TransactionHub({ counts = { assistance: 0, reports: 0 } }: Props) {
    const { currentMunicipality } = usePage<SharedProps>().props;
    const modules = [
        {
            title: 'Action Center Assistance',
            description: 'Medical, burial, financial, and other municipal aid requests.',
            icon: (
                <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-500 p-3 shadow-lg">
                    <HandHeart className="h-8 w-8 text-white" />
                </div>
            ),
            href: actionCenter.index.url(currentMunicipality.slug),
            hoverColor: 'group-hover:text-red-600',
            pendingCount: counts.assistance,
        },
        {
            title: 'Community Reports',
            description: 'Incident reports, road damages, and waste management concerns.',
            icon: (
                <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 shadow-lg">
                    <FileWarning className="h-8 w-8 text-white" />
                </div>
            ),
            href: communityReport.client.page.url(currentMunicipality.slug),
            hoverColor: 'group-hover:text-orange-600',
            pendingCount: counts.reports,
        },
        {
            title: 'Feedbacks',
            description: 'Review, validate, and resolve reported incidents or issues submitted.',
            icon: (
                <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 p-3 shadow-lg">
                    <AlertTriangle className="h-8 w-8 text-white" />
                </div>
            ),
            href: ListFeedbackController.url(currentMunicipality.slug), // NO HREF AT THE MOMENT
            hoverColor: 'group-hover:text-orange-600',
            pendingCount: 0,
        },
        // {
        //     title: 'Other Transactions',
        //     description: 'Non-emergency service requests, permits, and miscellaneous municipal transactions.',
        //     icon: Layers,
        //     href: communityReport.client.page.url(currentMunicipality.slug), // Placeholder route
        //     pendingCount: 0,
        // },
    ];

    return (
        <PublicLayout title="My Transactions" description="Track your requests and reports">
            <div className="min-h-screen bg-gray-50 px-4 py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-900 md:justify-start">My Transactions</h1>
                        <p className="mt-2 text-gray-500">
                            Viewing activity for <span className="font-semibold">{currentMunicipality.name}</span>.
                        </p>
                    </div>

                    {/* The Grid of Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {modules.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group relative flex transform flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl"
                            >
                                <div>
                                    <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-md`}>{item.icon}</div>
                                    <h3 className={`text-xl font-bold text-gray-900 transition-colors ${item.hoverColor}`}>{item.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.description}</p>
                                </div>

                                {/* <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                                    <div>
                                        {item.pendingCount > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span>
                                                {item.pendingCount} Updates
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-gray-400">No pending updates</span>
                                        )}
                                    </div>
                                    <div className="rounded-full bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">
                                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900" />
                                    </div>
                                </div> */}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
