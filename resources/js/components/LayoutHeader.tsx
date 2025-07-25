import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import GmitpLogo from './Gmitp-logo';
import { HeaderNav } from './Public/HeaderNavigation';
import { LeftNavigation } from './Public/LeftNavigation';
import { Input } from './ui/input';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function LayoutHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <>
            <div className="sticky top-0 z-50 w-full border-b border-sidebar-border/80 bg-white">
                <div className="flex h-16 items-center justify-between px-4">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <LeftNavigation />
                    </div>

                    <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                        <GmitpLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <HeaderNav />
                    </div>

                    <div className="ml-auto flex items-center space-x-4">
                        <div>
                            <Input type="search" placeholder="Search..." className="hidden rounded-3xl border border-gray-400 lg:flex" />
                        </div>
                        <div className="relative flex items-center space-x-1">
                            <Link
                                href={route('login.show')}
                                className="text-bold rounded-2xl border border-gray-600 p-1 px-3 font-bold text-gray-500"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
                    </div>
                </div>
            )}
        </>
    );
}
