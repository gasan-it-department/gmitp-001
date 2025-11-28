import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ActionCenterUi from './Components/ActionCenterForm/ActionCenterCard';
import Carousel from './Components/Carousel';
import FeedbackUi from './Components/FeedbackForm/FeedbackFormCard';
import InformationDashboard from './Components/InformationDashboard';
import Report from './Components/ReportForm/ReportFormCard';

export default function HomePage() {

    return (
        <PublicLayout title="Home" description="">
            <div>
                <Carousel />

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
        </PublicLayout>
    );
}
