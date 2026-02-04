import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import password from '@/routes/password';
import { useForm } from '@inertiajs/react';
import { 
    ShieldCheck, 
    Save
} from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import ToastProvider from '@/pages/Utility/ToastShower';
import { toast } from 'sonner'; 

export default function SecurityTab() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();

        put(password.change.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success("Password updated successfully.");
            },
            onError: () => {
                reset('password', 'password_confirmation');
                toast.error("Please check your input for errors.");
            },
        });
    }

    return (
        <div className="min-h-screen bg-slate-50/30">
            <div className="relative mx-auto max-w-5xl p-8">
                
                {/* --- PAGE HEADER --- */}
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center rounded-lg bg-orange-100 p-1.5 text-orange-600 shadow-sm border border-orange-200">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                                Security
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Protection</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Manage your password and secure your account access.
                        </p>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="pb-12">
                    <form onSubmit={handleSave}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            
                            {/* LEFT COLUMN: CONTEXT */}
                            <div className="md:col-span-4 flex flex-col items-center md:items-start">
                                <div className="w-full space-y-4">
                                    <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-sm">
                                        <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Password Status</h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Your password protects your personal data. We recommend updating it regularly to keep your account secure.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORM FIELDS */}
                            <div className="md:col-span-8">
                                
                                <div className="space-y-6 mb-8">
                                    
                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                            Current Password
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            placeholder="Enter your current password"
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            disabled={processing}
                                            error={errors.current_password}
                                            className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-900 shadow-sm"
                                        />
                                    </div>

                                    <div className="h-px bg-slate-200/60 my-6" />

                                    {/* New Password Group */}
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                New Password
                                            </Label>
                                            <PasswordInput
                                                id="new_password"
                                                placeholder="Enter new password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                disabled={processing}
                                                error={errors.password}
                                                className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-900 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirm_password" className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                Confirm New Password
                                            </Label>
                                            <PasswordInput
                                                id="confirm_password"
                                                placeholder="Re-enter new password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                error={errors.password_confirmation}
                                                className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 font-medium text-slate-900 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-6 border-t border-slate-200/50">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="h-11 min-w-[140px] bg-slate-900 text-white hover:bg-orange-600 shadow-lg shadow-slate-900/20 transition-all active:scale-95 font-bold rounded-xl"
                                    >
                                        {processing ? 'Updating...' : 'Update Password'}
                                        {!processing && <Save className="ml-2 h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <ToastProvider />
        </div>
    );
}