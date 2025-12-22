import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { Ban, Edit, KeyRound, MoreVertical, Settings } from 'lucide-react';

interface Props {
    userId: string;
    userName: string; // Optional: Used if you want to show alerts with their name later
}

export function UserDetailsActionMenu({ userId, userName }: Props) {
    // Action Handlers
    const handleEdit = () => {
        router.visit(route('superAdmin.users.edit', userId));
    };

    const handleResetPassword = () => {
        // Implement logic or modal open here
        console.log(`Resetting password for ${userName}`);
    };

    const handleDeactivate = () => {
        if (confirm(`Are you sure you want to deactivate ${userName}?`)) {
            // router.delete(route('superAdmin.users.destroy', userId));
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

                    <DropdownMenuItem onClick={handleDeactivate} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                        <Ban className="mr-2 h-4 w-4" />
                        Deactivate Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
