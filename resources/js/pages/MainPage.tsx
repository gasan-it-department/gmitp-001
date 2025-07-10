import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarMenu from './SideBar/AppSidebarMenu';
import { RouteNames } from './Utility/RouteNames';

export default function MainPage({ children }: { children: React.ReactNode }) {
    const [headTitle, headerTitle] = useState('Gasan Municipality');
    const { setOpenMobile } = useSidebar();
    const [selectedTab, tabSelected] = useState('home');

    const tabs = [
        { id: RouteNames.Home, label: 'Home' },
        { id: RouteNames.Government, label: 'Government' },
        { id: RouteNames.Services, label: 'Services' },
        { id: RouteNames.ExecutiveOrders, label: 'Executive Orders' },
        { id: RouteNames.NewsAndEventsPage, label: 'News and Events' },
        { id: RouteNames.TransparencyPage, label: 'Transparency' },
        { id: RouteNames.ContactUs, label: 'Contact Us' },
    ];

    return (
        <div className="h-screen w-full">
            <header className="sticky top-0 z-50 bg-white text-gray-900 shadow-md dark:bg-gray-900 dark:text-white">
                <div className="mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex w-full items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button onClick={() => setOpenMobile(true)} className="block lg:hidden">
                            <img src="/assets/menu_icon.png" alt="Menu Bar" className="h-5 w-5" />
                        </button>

                        <div className="text-xl font-bold" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                            {headTitle}
                        </div>

                        <div className="ml-5" />

                        <div className="hidden overflow-x-auto whitespace-nowrap lg:block">
                            <div className="flex space-x-4">
                                {tabs.map((tab) => (
                                    <Button
                                        key={tab.id}
                                        variant="ghost"
                                        onClick={() => {
                                            router.visit(route(tab.id));
                                            tabSelected(tab.id);
                                        }}
                                        className={`rounded-none border-b-2 ${
                                            selectedTab === tab.id ? 'border-black text-black' : 'hover:border-gray border-transparent text-gray-600'
                                        }`}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-grow" />

                        {/* <a className="hidden sm:block">
                            <Button onClick={() => isClassicDialogOpened(true)} variant="outline">
                                Log In
                            </Button>
                        </a> */}
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <AppSidebarMenu
                itemClicked={(itemId) => {
                    console.log(`Clicked on ${itemId}`);
                    setOpenMobile(false);
                    router.visit(route(itemId));
                }}
            />
        </div>
    );
}
