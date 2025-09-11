import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from '@/lib/axios';
import { LogOut } from 'lucide-react';

export function LogoutDialog() {
    const handleLogout = async () => {
        try {
            await axios.post('/logout'); // 🔐 Laravel logout route
            // Optionally clear local auth state here
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="flex w-full items-center justify-start gap-2 text-red-600 hover:bg-red-100">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Logout</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Are you sure you want to log out? You’ll need to sign back in to access your account.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        Yes, Logout
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
