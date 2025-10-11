import { Menu, UserIcon, LucideLogs, PlaneIcon, Landmark, Shield, PhoneIcon, HomeIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useState } from 'react';
import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';

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
                className="flex h-full w-64 flex-col justify-between bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-xl"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Header Section */}
                <SheetHeader className="flex items-center justify-start px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    {/* Optional logo placeholder */}
                    {/* <AppLogoIcon className="h-6 w-6 text-gray-900 dark:text-white" /> */}
                    <h2 className="text-lg font-semibold">Menu</h2>
                </SheetHeader>

                {/* Body */}
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {/* User Info */}
                    {auth.user && (
                        <div
                            onClick={() => router.visit(route("my.account.show"))}
                            className="flex items-center p-3 m-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition duration-200 ease-in-out"
                        >
                            <Avatar className="h-14 w-14 flex-shrink-0">
                                <AvatarImage
                                    src={
                                        typeof auth.user?.avatarUrl === "string" && auth.user?.avatarUrl
                                            ? auth.user?.avatarUrl
                                            : "https://www.gravatar.com/avatar/?d=mp"
                                    }
                                    alt="User avatar"
                                    className="rounded-full"
                                />
                            </Avatar>

                            <div className="ml-3 min-w-0">
                                <span className="block text-[15px] font-bold text-gray-900 dark:text-white truncate">
                                    {/* {auth.user?.name || "Unnamed User"} */} Sophie Rhys Sadiwa Fabunan
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    View Profile
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Sign In Button (If not logged in) */}
                    {!auth.user && (
                        <div className="px-3 pb-2">
                            <Button
                                className="w-full text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                                onClick={() => setLogInSignUpDialogVisible(true)}
                            >
                                Sign In
                            </Button>
                        </div>
                    )}

                    {/* Navigation Section */}
                    <div className="px-3 mt-2">
                        <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-2 block">
                            Explore
                        </span>

                        {/* Navigation Items */}
                        <nav className="flex flex-col space-y-1">
                            <SheetClose asChild>
                                <a
                                    onClick={() => router.visit(route("home.show"))}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <HomeIcon size={20} />
                                    <span className="text-sm font-medium">Home</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => console.log(`Clicked: Travel`)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <PlaneIcon size={20} />
                                    <span className="text-sm font-medium">Travel</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => console.log(`Clicked: Government`)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <Landmark size={20} />
                                    <span className="text-sm font-medium">Government</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => console.log(`Clicked: Transparency`)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <Shield size={20} />
                                    <span className="text-sm font-medium">Transparency</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    onClick={() => console.log(`Clicked: Contact Us`)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <PhoneIcon size={20} />
                                    <span className="text-sm font-medium">Contact Us</span>
                                </a>
                            </SheetClose>
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} YourApp. All rights reserved.
                </div>

                <LogInSignUpDialog
                    isOpen={isLogInSignUpDialogVisible}
                    onClose={() => setLogInSignUpDialogVisible(false)}
                />
            </SheetContent>
        </Sheet>

    );
}
