import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import CarouselComponent from '@/pages/Public/Home/Components/Carousel';
import FeatureSection from '@/pages/Public/Home/Components/FeatureSection';
import HomeFooter from '@/pages/Public/Home/Components/Footer';
import HeroBanner from '@/pages/Public/Home/Components/HeroBanner';
import ComplaintUi from './Components/ComplainUi';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import { useEffect, useState } from 'react';
import ActionCenterUi from './Components/ActionCenterUi';

export default function HomePage() {
    const [isLoadingDialogVisible, setLoadingDialogVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingDialogVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <PublicLayout title="Home" description="">
            <HeroBanner />
            <div className="flex flex-col md:flex-row w-full gap-4">
                <div className="flex-1">
                    <ComplaintUi />
                </div>
                
                <div className="flex-1">
                    <ActionCenterUi />
                </div>
            </div>


            <CarouselComponent />
            <FeatureSection />
            <HomeFooter />
            <LoadingDialog open={isLoadingDialogVisible} />
        </PublicLayout>
    );
}
