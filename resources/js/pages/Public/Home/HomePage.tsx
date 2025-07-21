import CarouselComponent from '@/components/Public/Home/Carousel';
import FeatrureSection from '@/components/Public/Home/FeatureSection';
import HomeFooter from '@/components/Public/Home/Footer';
import HeroBanner from '@/components/Public/Home/HeroBanner';
import PublicLayout from '@/layouts/Public/template/PublicLayoutTemplate';

const HomePage = () => {
    return (
        <PublicLayout title="Home" description="">
            <HeroBanner />
            <CarouselComponent />
            <FeatrureSection />
            <HomeFooter />
        </PublicLayout>
    );
};
export default HomePage;
