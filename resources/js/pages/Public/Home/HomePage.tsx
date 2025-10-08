import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ActionCenterUi from './Components/ActionCenterUi';
import FeedbackUi from './Components/FeedbackUi';
import Carousel from './Components/Carousel';
import InformationDashboard from './Components/InformationDashboard';

export default function HomePage() {
    return (
        <PublicLayout title="Home" description="">
            <div>
                <Carousel />

                <div className='h-5' />

                <div className="flex w-full flex-col gap-4 md:flex-row p-2">
                    <div className="flex-1 min-h-[200px]">
                        <FeedbackUi />
                    </div>

                    <div className="flex-1 min-h-[200px]">
                        <ActionCenterUi />
                    </div>
                </div>

                <div className='h-8' />

                <InformationDashboard />
            </div>

        </PublicLayout>
    );
}
