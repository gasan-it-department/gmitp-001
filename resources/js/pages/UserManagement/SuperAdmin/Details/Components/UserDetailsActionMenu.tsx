import DeactivateAdminController from '@/actions/App/External/Api/Controllers/UserManagement/DeactivateAdminController';
import ReactivateAdminController from '@/actions/App/External/Api/Controllers/UserManagement/ReactivateAdminController';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import superAdmin from '@/routes/superAdmin';
import { router } from '@inertiajs/react';
import { Ban, Edit, KeyRound, MoreVertical, RotateCcw, Settings } from 'lucide-react';

interface Props {
    userId: string;
    userName: string;
    isActive: boolean;
}

export function UserDetailsActionMenu({ userId, userName, isActive }: Props) {
    // Action Handlers
    const handleEdit = () => {
        router.visit(superAdmin.users.edit.url(userId));
    };

    const handleResetPassword = () => {
        // Implement logic or modal open here
        console.log(`Resetting password for ${userName}`);
    };

    const handleDeactivate = () => {
        if (confirm(`Deactivate ${userName}? They will lose all access and their module permissions will be revoked.`)) {
            router.put(DeactivateAdminController.url(userId));
        }
    };

    const handleReactivate = () => {
        if (confirm(`Reactivate ${userName}? You will need to re-grant their module permissions afterwards.`)) {
            router.put(ReactivateAdminController.url(userId));
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* 1. Primary Action: Edit */}
            <Button onClick={handleEdit} className="border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
            </Button>

            {/* 2. Secondary Actions: Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shadow-sm">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleResetPassword} className="cursor-pointer">
                        <KeyRound className="mr-2 h-4 w-4 text-gray-500" />
                        Reset Password
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4 text-gray-500" />
                        Manage Permissions
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Offboarding: deactivate (active) / reactivate (deactivated) */}
                    {isActive ? (
                        <DropdownMenuItem onClick={handleDeactivate} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Ban className="mr-2 h-4 w-4" />
                            Deactivate Account
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={handleReactivate} className="cursor-pointer text-green-700 focus:bg-green-50 focus:text-green-800">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reactivate Account
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
