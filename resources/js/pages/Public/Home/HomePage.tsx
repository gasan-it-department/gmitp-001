import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ActionCenterUi from './Components/ActionCenterForm/ActionCenterCard';
import FeedbackUi from './Components/FeedbackForm/FeedbackFormCard';
import Carousel from './Components/Carousel';
import InformationDashboard from './Components/InformationDashboard';
import Report from './Components/ReportForm/ReportFormCard';

export default function HomePage() {
    return (
        <PublicLayout title="Home" description="">
            <div>
                <Carousel />

                <div className='h-5' />

                <div className="flex w-full flex-col gap-4 md:flex-row p-2">
                    <div className="flex-1 min-h-[200px] lg:ml-5 lg:mr-5">
                        <FeedbackUi />
                    </div>

                    <div className="flex-1 min-h-[200px] lg:ml-5 lg:mr-5">
                        <ActionCenterUi />
                    </div>

                    <div className="flex-1 min-h-[200px] lg:ml-5 lg:mr-5">
                        <Report />
                    </div>
                </div>

                <div className='h-8' />

                <InformationDashboard />
            </div>

        </PublicLayout>
    );
}
