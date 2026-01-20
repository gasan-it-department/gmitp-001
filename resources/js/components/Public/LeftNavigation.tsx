import { useNavigation } from '@/layouts/Public/Components/navigationItems';
import { account } from '@/routes/';
import transaction from '@/routes/transaction';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { Activity, HomeIcon, Menu } from 'lucide-react'; // Added Activity Icon
import { LogInSignUpForm } from '../LoginSignUpForm';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

export function LeftNavigation() {
    const navItems = useNavigation();
    const { auth } = usePage<SharedData>().props;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    return (
        <Sheet>
            {/* 1. ACCESSIBILITY: Larger Trigger Button */}
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-12 w-12 hover:bg-gray-100">
                    <Menu className="h-8 w-8 text-gray-800" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                // 2. ACCESSIBILITY: Wider drawer (w-64 -> w-80) for larger text
                className="flex h-full w-80 flex-col justify-between bg-white text-gray-900 shadow-xl"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                <SheetHeader className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                </SheetHeader>

                <div className="flex flex-1 flex-col overflow-y-auto py-2">
                    {/* User Info Section */}
                    {auth?.user ? (
                        <div className="px-4 py-4">
                            <Link href={account.url({ municipality: currentMunicipality.slug })}>
                                <div className="flex cursor-pointer items-center rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                                    <Avatar className="h-16 w-16 flex-shrink-0">
                                        <AvatarImage
                                            src={
                                                typeof auth.user?.avatarUrl === 'string'
                                                    ? auth.user.avatarUrl
                                                    : 'https://www.gravatar.com/avatar/?d=mp'
                                            }
                                            alt="User avatar"
                                            className="rounded-full"
                                        />
                                    </Avatar>
                                    <div className="ml-4 min-w-0">
                                        {/* 3. ACCESSIBILITY: Larger Name */}
                                        <span className="block truncate text-lg font-bold text-gray-900">{auth.user?.first_name}</span>
                                        <span className="text-sm font-medium text-gray-600">View Profile</span>
                                    </div>
                                </div>
                            </Link>

                            {/* --- INSERTED: MY TRANSACTIONS LINK --- */}
                            {/* This is the best place: Right after profile, before general menu */}
                            <div className="mt-6 border-b border-gray-100 pb-6">
                                <span className="mb-3 block text-sm font-bold tracking-wider text-gray-500 uppercase">My Activity</span>
                                <SheetClose asChild>
                                    <a
                                        onClick={() => router.visit(transaction.index.url(currentMunicipality.slug))} // Change to your actual route
                                        className="flex items-center gap-4 rounded-xl bg-blue-50 p-4 text-blue-900 transition hover:bg-blue-100"
                                    >
                                        <Activity size={28} className="text-blue-600" />
                                        <span className="text-lg font-semibold">My Transactions</span>
                                    </a>
                                </SheetClose>
                            </div>
                            {/* -------------------------------------- */}
                        </div>
                    ) : (
                        <div className="px-5 py-6">
                            <LogInSignUpForm />
                        </div>
                    )}

                    {/* Main Navigation */}
                    <div className="px-4">
                        <span className="mb-3 block text-sm font-bold tracking-wider text-gray-500 uppercase">Services</span>

                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const href =
                                    typeof item.route === 'function' ? item.route({ municipality: currentMunicipality.slug }).url : item.route;

                                return (
                                    <SheetClose asChild key={item.title}>
                                        <a
                                            onClick={() => router.visit(href)}
                                            // 4. ACCESSIBILITY: Large padding (p-4), Large text (text-lg)
                                            className="flex items-center gap-4 rounded-xl p-3 text-gray-700 transition hover:bg-gray-100 hover:text-black"
                                        >
                                            {/* Larger Icons */}
                                            {Icon ? <Icon size={26} strokeWidth={2} /> : <HomeIcon size={26} />}
                                            <span className="text-lg font-medium">{item.title}</span>
                                        </a>
                                    </SheetClose>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} {currentMunicipality.name}
                </div>
            </SheetContent>
        </Sheet>
    );
}
