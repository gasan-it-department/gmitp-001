import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { LogoutDialog } from '../Auth/LogoutDialog';

export function UserDropdownMenu() {
    const { auth } = usePage<SharedData>().props;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="hoverRed flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                <span className="text-base">Welcome!</span>
                <span className="max-w-[6ch] truncate font-bold uppercase lg:max-w-[20ch]">{auth.user.user_name}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="font-bold">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Logs</DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutDialog />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
