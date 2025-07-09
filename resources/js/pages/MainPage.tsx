import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import AppSidebarMenu from './SideBar/AppSidebarMenu';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { RouteNames } from './Utility/RouteNames';
import { useLocation, useNavigate } from 'react-router';

export default function MainPage({ children }: { children: React.ReactNode }) {
    const [dialogOpened, isClassicDialogOpened] = useState(false);
    const [headTitle, headerTitle] = useState("Gasan Municipality");
    const { setOpenMobile } = useSidebar();

    const lastPage = localStorage.getItem('last_page');

    const tabs = [
        { id: RouteNames.Home, label: "Home" },
        { id: RouteNames.Government, label: "Government" },
        { id: RouteNames.Services, label: "Services" },
        { id: RouteNames.ExecutiveOrders, label: "Executive Orders" },
        { id: RouteNames.NewsAndEventsPage, label: "News & Events" },
        { id: "transparency", label: "Transparency" },
        { id: "contact_us", label: "Contact Us" }
    ];

    const handleCurrentUrl = (id: string) => {
        if (lastPage == id) return true
        return false

    }
    console.log('Last visited page:', lastPage);

    return (
        <div className=' w-full h-screen'>
            <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md">
                <div className="mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex w-full items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setOpenMobile(true)}
                            className="block lg:hidden"
                        >
                            <img src="/assets/menu_icon.png" alt="Menu Bar" className="h-5 w-5" />
                        </button>

                        <div
                            className="flex text-xl font-bold"
                            style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
                        >
                            {headTitle}
                        </div>

                        <div className='w-10' />

                        <div className="overflow-x-auto whitespace-nowrap hidden sm:block">
                            <div className="flex space-x-4">
                                {tabs.map((tab) => (
                                    <Button
                                        key={tab.id}
                                        variant="ghost"
                                        onClick={() => {
                                            localStorage.setItem('last_page', tab.id);
                                            router.visit(route(tab.id));
                                        }}
                                        className={`active:border-blue-600 text-blue-600 rounded-none border-b-2 ${handleCurrentUrl(tab.id)
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:border-blue-400'
                                            }`}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>
                        </div>


                        <div className='flex-grow' />

                        <a className="hidden sm:block">
                            <Button variant="outline">Log In</Button>
                        </a>
                    </div>

                </div>
            </header>

            <main>{children}</main>

            {/* Classic Dialog */}
            <ClassicDialog
                isOpen={dialogOpened}
                title="Classic Dialog Test"
                message="This is a simple dialog message."
                positiveButtonTitle="Close"
                onClosed={() => isClassicDialogOpened(false)}
                onPositiveClicked={() => isClassicDialogOpened(false)}
                onNegativeClicked={() => { }}
            />

            <AppSidebarMenu
                itemClicked={(itemId) => {
                    console.log(`Clicked on ${itemId}`);
                    setOpenMobile(false);
                    router.visit(route(itemId));
                }} />
        </div>
    );
}