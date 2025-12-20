import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { account } from '@/routes';
import actionCenter from '@/routes/actionCenter';
import superAdmin from '@/routes/superAdmin';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function UserDropdownMenu() {
    const { auth } = usePage<SharedData>().props;
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentMunicipality } = useMunicipality();

    const adminMunicipalSlug = auth.user.municipality?.slug;

    const handleLogout = async () => {
        try {
            await AuthApi.logout();
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
                    {auth.roles?.isAdmin && adminMunicipalSlug && (
                        <DropdownMenuItem
                            onClick={() => {
                                // localStorage.setItem('activeSidebarUrl', "/gasan-4905/action-center/admin");
                                router.visit(actionCenter.admin.index.url({ municipality: adminMunicipalSlug }));
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
                            router.visit(account.url({ municipality: currentMunicipality.slug }));
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
