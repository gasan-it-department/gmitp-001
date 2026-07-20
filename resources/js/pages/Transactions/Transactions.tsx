import ListFeedbackController from '@/actions/App/External/Web/Controllers/Feedback/Client/ListFeedbackController';
import PublicLayout from '@/layouts/Public/PublicLayout';
import actionCenter from '@/routes/actionCenter';
import communityReport from '@/routes/communityReport';
import supportTicket from '@/routes/supportTicket';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ChevronRight, FileWarning, HandHeart } from 'lucide-react';

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
            icon: HandHeart,
            href: actionCenter.index.url(currentMunicipality.slug),
            pendingCount: counts.assistance,
        },
        {
            title: 'Community Reports',
            description: 'Incident reports, road damages, and waste management concerns.',
            icon: FileWarning,
            href: communityReport.index.url(currentMunicipality.slug),
            pendingCount: counts.reports,
        },
        {
            title: 'Feedbacks',
            description: 'Review, validate, and resolve reported incidents or issues submitted.',
            icon: AlertTriangle,
            href: ListFeedbackController.url(currentMunicipality.slug),
            pendingCount: 0,
        },
        {
            title: 'Support Ticket',
            description: 'Review, validate, and resolve reported incidents or issues submitted.',
            icon: AlertTriangle,
            href: supportTicket.index.url(currentMunicipality.slug),
            pendingCount: 0,
        },
    ];

    return (
        <PublicLayout title="My Transactions" description="Track your requests and reports">
            <div className="min-h-screen bg-background pt-8 pb-20 md:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
                    {/* Minimalist Header */}
                    <div className="mb-8 md:mb-10">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">My Transactions</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Viewing activity for {currentMunicipality.name}</p>
                    </div>

                    {/* The Clean Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                        {modules.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-transparent p-6 transition-colors hover:border-border/80 hover:bg-muted/30"
                            >
                                <div className="flex items-start justify-between">
                                    {/* Icon & Text Wrapper */}
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                                            <item.icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium text-foreground">{item.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>

                                    {/* Navigation Hint */}
                                    <ChevronRight
                                        size={20}
                                        strokeWidth={1.5}
                                        className="text-muted-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                                    />
                                </div>

                                {/* Minimalist Pending Count Badge (if you want to re-enable it) */}
                                {item.pendingCount > 0 && (
                                    <div className="mt-6 flex items-center gap-2 pl-10">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground"></span>
                                        </span>
                                        <span className="text-xs font-medium text-foreground">{item.pendingCount} pending</span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
