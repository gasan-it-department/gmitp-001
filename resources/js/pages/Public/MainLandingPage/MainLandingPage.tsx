import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";
import LandingPageHeroBanner from "@/pages/Public/MainLandingPage/Components/LandingPageHeroBanner";
import LandingPageFooter from "@/pages/Public/MainLandingPage/Components/LandingPageFooter";

export default function MainLandingPage() {
    return (
        <div className="p-0">
            <LandingPageHeroBanner/>
            <LandingPageFooter/>
        </div>
    );
}