import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { HomeIcon, Landmark, Menu, PhoneIcon, PlaneIcon, Shield } from 'lucide-react';
import { useState } from 'react';
import { LogInSignUpForm } from '../LoginSignUpForm';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useNavigation } from '@/config/navigation/navigationItems';

export function LeftNavigation() {
    const navItems = useNavigation();
    const { auth } = usePage<SharedData>().props;
    const [isLogInSignUpDialogVisible, setLogInSignUpDialogVisible] = useState(false);

    return (
        <Sheet>
            {/* Menu Button */}
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 h-[34px] w-[34px]"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            {/* Menu Drawer */}
            <SheetContent
                side="left"
                className="flex h-full w-64 flex-col justify-between bg-white text-gray-800 shadow-xl dark:bg-gray-900 dark:text-gray-100"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Header */}
                <SheetHeader className="flex items-center justify-start border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <h2 className="text-lg font-semibold">Menu</h2>
                </SheetHeader>

                {/* Body */}
                <div className="flex flex-1 flex-col overflow-y-auto">
                    {/* User Info */}
                    {auth?.user && (
                        <div
                            onClick={() => router.visit(route("my.account.show"))}
                            className="m-3 flex cursor-pointer items-center rounded-xl p-3 transition duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Avatar className="h-14 w-14 flex-shrink-0">
                                <AvatarImage
                                    src={
                                        typeof auth.user?.avatarUrl === "string" && auth.user?.avatarUrl
                                            ? auth.user.avatarUrl
                                            : "https://www.gravatar.com/avatar/?d=mp"
                                    }
                                    alt="User avatar"
                                    className="rounded-full"
                                />
                            </Avatar>

                            <div className="ml-3 min-w-0">
                                <span className="block truncate text-[15px] font-bold text-gray-900 dark:text-white p-0.5">
                                    {auth.user?.first_name} {auth.user?.last_name}
                                </span>
                                <div className='flex flex-col'>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 p-0.5">{auth.user?.phone}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sign In Button */}
                    {!auth?.user && (
                        <div className="px-3 pb-2">
                            <LogInSignUpForm />
                        </div>
                    )}

                    {/* Navigation Section */}
                    <div className="mt-2 px-3">
                        <span className="mb-2 block text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Explore
                        </span>

                        <nav className="flex flex-col space-y-1">
                            {navItems.map((item, index) => (
                                <SheetClose asChild key={index}>
                                    <a
                                        onClick={() => router.visit(item.href)}
                                        className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {item.icon && <item.icon size={20} />}
                                        <span className="text-sm font-medium">{item.title}</span>
                                    </a>
                                </SheetClose>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 text-center text-[10px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    © {new Date().getFullYear()} All rights reserved.
                </div>
            </SheetContent>
        </Sheet>
    );
}
