import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ActionCenterUi from './Components/ActionCenterForm/ActionCenterCard';
import Carousel, { Banner } from './Components/Carousel';
import FeedbackUi from './Components/FeedbackForm/FeedbackFormCard';
import InformationDashboard from './Components/InformationDashboard';
import Report from './Components/ReportForm/ReportFormCard';
import { AlertTriangle, Hammer } from 'lucide-react'; // Added icons
import Utility from '@/pages/Utility/Utility';

// Define Props
interface HomePageProps {
    banners: Banner[];
}

export default function HomePage({ banners }: HomePageProps) {
    return (
        <PublicLayout title="Home" description="">
            <div>
                {/* --- ALPHA TEST NOTICE --- */}
                <div className="bg-amber-500 px-4 py-3 text-white shadow-sm relative z-20">
                    <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-3 text-center">
                        <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
                        <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
                            <span className="font-black uppercase tracking-widest text-xs sm:text-sm">
                                System Alpha Test
                            </span>
                            <span className="hidden h-4 w-px bg-white/40 sm:block" />
                            <span className="text-[10px] font-medium leading-tight text-white/90 sm:text-xs">
                                This portal is currently under active development. Report any bugs or errors. ({Utility().getCurrentWebsiteVersion()})
                            </span>
                        </div>
                    </div>
                </div>

                <Carousel slides={banners} />
                
                <div className='max-w-[2000px] mx-auto'>
                    <div className="h-5" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:pr-8 lg:pl-8">
                        <div className="flex-1">
                            <FeedbackUi />
                        </div>
                        <div className="flex-1">
                            <ActionCenterUi />
                        </div>
                        <div className="flex-1">
                            <Report />
                        </div>
                    </div>
                    <div className="h-8" />
                    <InformationDashboard />
                </div>
            </div>
        </PublicLayout>
    );
}