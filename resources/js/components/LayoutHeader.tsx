import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import GmitpLogo from './Gmitp-logo';
import { LogInSignUpForm } from './LoginSignUpForm';
import { HeaderNav } from './Public/HeaderNavigation';
import { LeftNavigation } from './Public/LeftNavigation';
import { UserDropdownMenu } from './Shared/UserDropDownMenu';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function LayoutHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <div className="sticky top-0 z-50 w-full border-b border-sidebar-border/80 bg-white">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="hidden max-[1210px]:block">
                        <LeftNavigation />
                    </div>

                    <Link href="/home" prefetch className="pointer-events-none flex items-center space-x-2 md:pointer-events-auto">
                        <GmitpLogo />
                    </Link>

                    <div className="ml-6 hidden h-full items-center space-x-6 min-[1210px]:flex">
                        <HeaderNav />
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                        <div className="relative hidden items-center space-x-1 min-[1210px]:flex">
                            {auth.user ? <UserDropdownMenu /> : <LogInSignUpForm />}
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
