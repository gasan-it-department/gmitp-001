import { UserDropdownMenu } from '@/components/Shared/UserDropDownMenu';
import { CircleUser } from 'lucide-react';
import { Separator } from '../../../components/ui/separator';
import { SidebarTrigger } from '../../../components/ui/sidebar';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="">
                <CircleUser className="h-5 w-5" />
            </SidebarTrigger>
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            {/* <div className="flex flex-1 justify-end">
                <UserDropdownMenu />
            </div> */}
        </header>
    );
}
