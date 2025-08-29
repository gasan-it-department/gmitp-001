import { Menu, UserIcon, LucideLogs, PlaneIcon, Landmark, Shield, PhoneIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { router } from '@inertiajs/react';

export function LeftNavigation() {

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetHeader className="flex justify-start text-left">
                    {/* <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" /> */}
                </SheetHeader>
                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                    <div className="flex h-full flex-col text-sm">
                        <div className="flex flex-col space-y-4"></div>

                        <div className="flex flex-col space-y-2 overflow-y-auto">
                            <span className="text-[13px] text-gray-700">Account</span>
                            <SheetClose asChild>
                                <a
                                    key={"My Account"}
                                    onClick={() => {
                                        router.visit(route("my.account.show"));
                                    }}
                                    className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-black-800"
                                >
                                    <UserIcon size={25} />
                                    <span className='p-1 font-bold'>My Account</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    key={"Activity Log"}
                                    onClick={() => console.log(`Clicked: Activity Log`)}
                                    className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-black-800"
                                >
                                    <LucideLogs size={25} />
                                    <span className='p-1 font-bold'>Activity Log</span>
                                </a>
                            </SheetClose>

                            <div className='mt-2 mb-2' />

                            <span className="text-[13px] text-gray-700">Explore</span>
                            <SheetClose asChild>
                                <a
                                    key={"Travel"}
                                    onClick={() => console.log(`Clicked: Travel`)}
                                    className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-black-800"
                                >
                                    <PlaneIcon size={25} />
                                    <span className="p-1 font-bold">Travel</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    key={"Government"}
                                    onClick={() => console.log(`Clicked: Government`)}
                                    className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-black-800"
                                >
                                    <Landmark size={25} />
                                    <span className="p-1 font-bold">Government</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    key={"Activity Log"}
                                    onClick={() => console.log(`Clicked: Transparency`)}
                                    className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-black-800"
                                >
                                    <Shield size={25} />
                                    <span className="p-1 font-bold">Transparency</span>
                                </a>
                            </SheetClose>

                            <SheetClose asChild>
                                <a
                                    key={"Contact"}
                                    onClick={() => console.log(`Clicked: Contact Us`)}
                                    className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-black-800"
                                >
                                    <PhoneIcon size={25} />
                                    <span className="p-1 font-bold">Contact Us</span>
                                </a>
                            </SheetClose>


                            {/* {sidebarItem.map((item) => {
                                const IconComp = item.icon;
                                return (
                                    <a
                                        key={item.title}
                                        onClick={() => console.log(`Clicked: ${item.id}`)}
                                        className="flex cursor-pointer items-center space-x-2 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-blue-600"
                                    >
                                        {IconComp && <IconComp className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </a>
                                );
                            })} */}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
