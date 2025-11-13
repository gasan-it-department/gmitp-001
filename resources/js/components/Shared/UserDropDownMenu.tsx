import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import axios from '@/lib/axios';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import admin from '@/routes/admin';
import superAdmin from '@/routes/superAdmin';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function UserDropdownMenu() {
    const { auth } = usePage<SharedData>().props;
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentMunicipality } = useMunicipality();

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
                    <div className="flex cursor-pointer items-center gap-2">
                        <div className="rounded-full p-1 transition-colors duration-200 hover:bg-gray-200">
                            <img
                                src={
                                    auth.user?.avatarUrl === 'string' && auth.user?.avatarUrl
                                        ? auth.user?.avatarUrl
                                        : 'https://www.gravatar.com/avatar/?d=mp'
                                }
                                alt="User Avatar"
                                className="h-10 w-10 rounded-full"
                            />
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="font-bold">
                    <DropdownMenuLabel className="p-1 text-[13px] italic">
                        {auth.user?.first_name} {auth.user?.last_name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {auth.roles?.isAdmin && (
                        <DropdownMenuItem
                            onClick={() => {
                                router.visit(admin.dashboard.url({ municipality: currentMunicipality.slug }));
                            }}
                        >
                            Admin Panel
                        </DropdownMenuItem>
                    )}

                    {auth.roles?.isSuperAdmin && (
                        <DropdownMenuItem
                            onClick={() => {
                                router.visit(superAdmin.dashboard.url());
                            }}
                        >
                            S-Admin Panel
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={() => {
                            router.visit(route('my.account.show'));
                        }}
                    >
                        Profile
                    </DropdownMenuItem>

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
