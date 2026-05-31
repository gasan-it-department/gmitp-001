import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import Utility from '@/pages/Utility/Utility';
import { AlertTriangle } from 'lucide-react';
import ActionCenterUi from './Components/ActionCenterForm/ActionCenterCard';
import Carousel, { Banner } from './Components/Carousel';
import EventsCalendarUi from './Components/EventsCalendarUi';
import FeedbackUi from './Components/FeedbackForm/FeedbackFormCard';
import GeneralAnnouncementUi from './Components/GeneralAnnouncementUi';
import InformationDashboard from './Components/InformationDashboard';
import Report from './Components/ReportForm/ReportFormCard';

// Define Props
interface HomePageProps {
    banners: Banner[];
    announcements: PaginatedResponse<any>;
    events: any;
}

export default function HomePage({ banners, announcements, events }: HomePageProps) {
    return (
        <PublicLayout title="Home" description="">
            <div className="bg-background">
                {/* --- ALPHA TEST NOTICE --- */}
                <div className="relative z-20 bg-amber-500 px-4 py-3 text-white shadow-sm">
                    <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-3 text-center">
                        <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
                        <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
                            <span className="text-xs font-black tracking-widest uppercase sm:text-sm">System Alpha Test</span>
                            <span className="hidden h-4 w-px bg-white/40 sm:block" />
                            <span className="text-[10px] leading-tight font-medium text-white/90 sm:text-xs">
                                This portal is currently under active development. Report any bugs or errors. ({Utility().getCurrentWebsiteVersion()})
                            </span>
                        </div>
                    </div>
                </div>

                <Carousel slides={banners} />

                <div className="mx-auto max-w-screen-2xl">
                    <div className="h-8" />

                    {/* Primary Actions Grid */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <FeedbackUi />
                            <ActionCenterUi />
                            <Report />
                        </div>
                    </div>

                    <div className="h-12" />

                    {/* Information Dashboard */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <InformationDashboard />
                    </div>

                    <div className="h-12" />

                    {/* Announcements & Events Section */}
                    <div className="grid grid-cols-1 gap-0 divide-border border-t border-border lg:grid-cols-12 lg:divide-x">
                        <div className="lg:col-span-8">
                            <GeneralAnnouncementUi announcements={announcements} />
                        </div>
                        <div className="bg-muted/10 lg:col-span-4">
                            <EventsCalendarUi events={events} />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
