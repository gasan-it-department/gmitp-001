import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { HomeIcon, Landmark, Menu, PhoneIcon, PlaneIcon, Shield } from 'lucide-react';
import { useState } from 'react';
import { LogInSignUpForm } from '../LoginSignUpForm';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

export function LeftNavigation() {
    const { auth } = usePage<SharedData>().props;
    const [isLogInSignUpDialogVisible, setLogInSignUpDialogVisible] = useState(false);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="flex h-full w-64 flex-col justify-between bg-white text-gray-800 shadow-xl dark:bg-gray-900 dark:text-gray-100"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Header Section */}
                <SheetHeader className="flex items-center justify-start border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    {/* Optional logo placeholder */}
                    {/* <AppLogoIcon className="h-6 w-6 text-gray-900 dark:text-white" /> */}
                    <h2 className="text-lg font-semibold">Menu</h2>
                </SheetHeader>

                {/* Body */}
                <div className="flex flex-1 flex-col overflow-y-auto">
                    {/* User Info */}
                    {auth.user && (
                        <div
                            onClick={() => router.visit(route('my.account.show'))}
                            className="m-3 flex cursor-pointer items-center rounded-xl p-3 transition duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Avatar className="h-14 w-14 flex-shrink-0">
                                <AvatarImage
                                    src={
                                        typeof auth.user?.avatarUrl === 'string' && auth.user?.avatarUrl
                                            ? auth.user?.avatarUrl
                                            : 'https://www.gravatar.com/avatar/?d=mp'
                                    }
                                    alt="User avatar"
                                    className="rounded-full"
                                />
                            </Avatar>

                            <div className="ml-3 min-w-0">
                                <span className="block truncate text-[15px] font-bold text-gray-900 dark:text-white">
                                    {/* {auth.user?.name || "Unnamed User"} */} Sophie Rhys Sadiwa Fabunan
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">View Profile</span>
                            </div>
                        </div>
                    )}

                    {/* Sign In Button (If not logged in) */}
                    {!auth.user && (
                        <div className="px-3 pb-2">
                            {/* <Button
                                className="w-full text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                                onClick={() => setLogInSignUpDialogVisible(true)}
                            >
                                Sign In
                            </Button> */}
                            <LogInSignUpForm />
                        </div>
                    )}

                    {/* Navigation Section */}
                    <div className="mt-2 px-3">
                        <span className="mb-2 block text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Explore</span>

                        {/* Navigation Items */}
                        <nav className="flex flex-col space-y-1">
                            <SheetClose asChild>
                                <a
                                    onClick={() => router.visit(route('home.show'))}
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <HomeIcon size={20} />
                                    <span className="text-sm font-medium">Home</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => {
                                        router.visit(route('travel.page.show'));
                                    }}
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <PlaneIcon size={20} />
                                    <span className="text-sm font-medium">Travel</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => {
                                        router.visit(route('government.show'));
                                    }}
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Landmark size={20} />
                                    <span className="text-sm font-medium">Government</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => router.visit(route('transparency.show'))}
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Shield size={20} />
                                    <span className="text-sm font-medium">Transparency</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => router.visit(route('contact.us.show'))}
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <PhoneIcon size={20} />
                                    <span className="text-sm font-medium">Contact Us</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => router.visit(route('executive.order.show'))}
                                    className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <PhoneIcon size={20} />
                                    <span className="text-sm font-medium">Executive Orders</span>
                                </a>
                            </SheetClose>
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    © {new Date().getFullYear()} YourApp. All rights reserved.
                </div>

                {/* <LogInSignUpDialog
                    isOpen={isLogInSignUpDialogVisible}
                    onClose={() => setLogInSignUpDialogVisible(false)}
                /> */}
            </SheetContent>
        </Sheet>
    );
}
