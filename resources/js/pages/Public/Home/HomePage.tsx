import PublicLayout from '@/layouts/Public/template/PublicLayoutTemplate';
import CarouselComponent from '@/pages/Public/Home/Components/Carousel';
import FeatrureSection from '@/pages/Public/Home/Components/FeatureSection';
import HomeFooter from '@/pages/Public/Home/Components/Footer';
import HeroBanner from '@/pages/Public/Home/Components/HeroBanner';

export default function HomePage() {
    return (
        <PublicLayout title="Home" description="">
            <HeroBanner />
            <CarouselComponent />
            <FeatrureSection />
            <HomeFooter />
        </PublicLayout>
    );
}
