import ListFeedbackController from '@/actions/App/External/Web/Controllers/Feedback/Client/ListFeedbackController';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import actionCenter from '@/routes/actionCenter';
import communityReport from '@/routes/communityReport';
import { Link, usePage } from '@inertiajs/react';
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
            icon: HandHeart,
            href: actionCenter.index.url(currentMunicipality.slug),
            pendingCount: counts.assistance,
        },
        {
            title: 'Community Reports',
            description: 'Incident reports, road damages, and waste management concerns.',
            icon: FileWarning,
            href: communityReport.client.page.url(currentMunicipality.slug),
            pendingCount: counts.reports,
        },
        {
            title: 'Feedbacks',
            description: 'Review, validate, and resolve reported incidents or issues submitted.',
            icon: AlertTriangle,
            href: ListFeedbackController.url(currentMunicipality.slug),
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
            <div className="min-h-screen bg-muted/30 px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-10 text-center md:text-left space-y-2">
                        <h1 className="flex items-center justify-center gap-3 text-3xl font-black uppercase tracking-widest text-foreground md:justify-start">
                            My Transactions
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Viewing activity for <span className="text-primary font-bold">{currentMunicipality.name}</span>
                        </p>
                    </div>

                    {/* The Grid of Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {modules.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group relative flex transform flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                            >
                                <div>
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-medium">
                                        {item.description}
                                    </p>
                                </div>

                                {/* <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                                    <div>
                                        {item.pendingCount > 0 ? (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
                                                {item.pendingCount} Pending Updates
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                                No pending updates
                                            </span>
                                        )}
                                    </div>
                                    <div className="rounded-full bg-muted/50 p-2 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
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