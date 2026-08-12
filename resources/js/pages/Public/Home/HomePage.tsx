import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import { absoluteUrl, SeoSharedData } from '@/components/Seo/PublicSeo';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { usePage } from '@inertiajs/react';
import ActionCenterUi from './Components/ActionCenterForm/ActionCenterCard';
import Carousel from './Components/Carousel';
import EventsCalendarUi from './Components/EventsCalendarUi';
import FeedbackUi from './Components/FeedbackForm/FeedbackFormCard';
import GeneralAnnouncementUi from './Components/GeneralAnnouncementUi';
import InformationDashboard from './Components/InformationDashboard';
import Report from './Components/ReportForm/ReportFormCard';

// Define Props
interface HomePageProps {
    announcements: PaginatedResponse<any>;
    events: any;
}

export default function HomePage({ announcements, events }: HomePageProps) {
    const { currentMunicipality, seo } = usePage<{ currentMunicipality: Municipality; seo: SeoSharedData }>().props;
    const homeUrl = absoluteUrl(`/${currentMunicipality.slug}/home`, seo.site_url);
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'GovernmentOrganization',
        name: `Municipality of ${currentMunicipality.name}`,
        url: homeUrl,
        image: seo.default_image,
        address: {
            '@type': 'PostalAddress',
            addressLocality: currentMunicipality.name,
            addressRegion: 'Marinduque',
            postalCode: currentMunicipality.zip_code,
            addressCountry: 'PH',
        },
    };

    return (
        <PublicLayout
            title={`Municipality of ${currentMunicipality.name}`}
            description={`Official citizen portal of the Municipality of ${currentMunicipality.name}, Marinduque. Access municipal services, announcements, events, and public information online.`}
            canonicalUrl={homeUrl}
            structuredData={organizationSchema}
        >
            <div className="bg-background">
                <h1 className="sr-only">Official Citizen Portal of the Municipality of {currentMunicipality.name}</h1>
                {/* --- ALPHA TEST NOTICE --- */}
                {/* <div className="relative z-20 bg-amber-500 px-4 py-3 text-white shadow-sm">
                    <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-3 text-center">
                        <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
                        <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
                            <span className="text-xs font-black tracking-widest uppercase sm:text-sm">Pagsusuri ng Alpha System</span>
                            <span className="hidden h-4 w-px bg-white/40 sm:block" />
                            <span className="text-[10px] leading-tight font-medium text-white/90 sm:text-xs">
                                Ang portal na ito ay kasalukuyang binubuo. I-report ang anumang bug o error. ({Utility().getCurrentWebsiteVersion()})
                            </span>
                        </div>
                    </div>
                </div> */}

                <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
                    <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
                        <Carousel slides={currentMunicipality.settings?.banner_urls} />
                    </div>
                </div>

                <div className="mx-auto max-w-screen-2xl">
                    <div className="h-6 sm:h-8" />

                    {/* Primary Actions Grid */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Mga Pangunahing Serbisyo</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                            <FeedbackUi />
                            <ActionCenterUi />
                            <Report />
                        </div>
                    </div>

                    <div className="h-8 sm:h-10" />

                    {/* Information Dashboard */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <InformationDashboard />
                    </div>

                    <div className="h-8 sm:h-10" />

                    {/* Announcements & Events Section */}
                    <div className="px-4 pb-10 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm shadow-primary/5 backdrop-blur lg:grid-cols-12 lg:p-5">
                            <div className="lg:col-span-8">
                                <GeneralAnnouncementUi announcements={announcements} />
                            </div>
                            <div className="rounded-lg border border-primary/10 bg-primary/[0.03] lg:col-span-4">
                                <EventsCalendarUi events={events} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
