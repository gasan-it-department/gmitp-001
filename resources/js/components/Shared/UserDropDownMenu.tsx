import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import transaction from '@/routes/transaction';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { FileText, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
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
                    <button className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-gray-300 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none">
                        <img
                            src={
                                auth.user?.avatarUrl && auth.user.avatarUrl !== 'string'
                                    ? auth.user.avatarUrl
                                    : 'https://www.gravatar.com/avatar/?d=mp'
                            }
                            alt={auth.user?.first_name || 'User'}
                            className="h-full w-full object-cover"
                        />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                    {/* User Header */}
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm leading-none font-medium">
                                {auth.user?.first_name} {auth.user?.last_name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground opacity-70">{auth.user?.email}</p>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* Administrative Group */}
                    <DropdownMenuGroup>
                        {auth.roles?.isAdmin && adminMunicipalSlug && (
                            <DropdownMenuItem
                                onClick={() => router.visit(actionCenter.admin.index.url({ municipality: adminMunicipalSlug }))}
                                className="cursor-pointer"
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Admin Panel</span>
                            </DropdownMenuItem>
                        )}

                        {auth.roles?.isSuperAdmin && (
                            <DropdownMenuItem onClick={() => router.visit(superAdmin.dashboard.url())} className="cursor-pointer">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>S-Admin Panel</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>

                    {(auth.roles?.isAdmin || auth.roles?.isSuperAdmin) && <DropdownMenuSeparator />}

                    {/* Personal Group */}
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => router.visit(account.url({ municipality: currentMunicipality.slug }))}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => {
                                // Updated to visit a page instead of opening logout dialog
                                router.visit(transaction.index.url(currentMunicipality.slug)); // Update this to your actual route
                            }}
                            className="cursor-pointer"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            <span>My Transactions</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Destructive Group (Logout) */}
                    <DropdownMenuItem
                        onClick={() => {
                            setOpenLogoutDialog(true);
                            setMenuOpen(false);
                        }}
                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

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
