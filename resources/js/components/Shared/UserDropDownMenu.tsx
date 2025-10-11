import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { useState } from 'react';
import axios from '@/lib/axios';

export function UserDropdownMenu() {
    const { auth } = usePage<SharedData>().props;
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await axios.post('/logout');
            window.location.href = response.data.redirect;
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="hover:bg-gray-200 rounded-full p-1 transition-colors duration-200">
                            <img
                                src={auth.user?.avatarUrl === 'string' && auth.user?.avatarUrl
                                    ? auth.user?.avatarUrl
                                    : "https://www.gravatar.com/avatar/?d=mp"}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full"
                            />
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="font-bold">
                    <DropdownMenuLabel className="text-[13px] italic p-1">
                        {`Sophie Rhys Sadiwa Fabunan 12345678`.length > 16
                            ? `Sophie Rhys Sadiwa Fabunan 12345678`.slice(0, 16) + "..."
                            : `Sophie Rhys Sadiwa Fabunan 12345678`}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {
                        (auth.roles.isClient) && <DropdownMenuItem onClick={() => {
                            router.visit(route("my.account.show"));
                        }}>Profile</DropdownMenuItem>
                    }

                    {/* Log out opens dialog */}
                    <DropdownMenuItem
                        onClick={() => {
                            setOpenLogoutDialog(true);
                            setMenuOpen(false);
                        }}
                    >
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation dialog */}
            <ClassicDialog
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                open={openLogoutDialog}
                hideNegativeButton={false}
                positiveButtonText="Log out"
                negativeButtonText="Cancel"
                onPositiveClick={handleLogout}
                onNegativeClick={() => setOpenLogoutDialog(false)}
            />
        </>
    );
}
