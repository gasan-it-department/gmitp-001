
import AdminLayout from '@/layouts/App/AppLayout';
import HomeBannerEditorPanel from './Components/HomeBannerEditorPanel';

export default function HoemBannerEditorPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <HomeBannerEditorPanel />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}