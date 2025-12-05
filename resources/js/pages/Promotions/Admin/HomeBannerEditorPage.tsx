import AdminLayout from '@/layouts/App/AppLayout';
import HomeBannerEditorPanel, { Banner } from './Components/HomeBannerEditorPanel';

// Define the props expected from Inertia
interface HoemBannerEditorPageProps {
    banners: Banner[];
}

export default function HoemBannerEditorPage({ banners }: HoemBannerEditorPageProps) {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        {/* Pass the banners from the backend to the panel */}
                        <HomeBannerEditorPanel initialBanners={banners} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
