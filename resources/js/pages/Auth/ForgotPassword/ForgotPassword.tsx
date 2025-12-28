import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import password from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Loader2, Smartphone } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword() {
    // 1. Use Inertia form helper for easy submission and error handling
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // 2. Post to the route defined in web.php that handles sending the OTP
        // e.g., Route::post('forgot-password', ...)->name('password.phone');
        post(password.phone.url());
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Head title="Forgot Password" />

            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-gray-200/50">
                {/* === Header Section === */}
                <div className="text-center">
                    {/* Icon with theme colors */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50 ring-1 ring-orange-100">
                        <KeyRound className="h-8 w-8 text-orange-600" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Forgot password?</h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        No worries, we'll help you reset it. Enter your registered phone number below to receive a verification code.
                    </p>
                </div>

                {/* === Form Section === */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                            Phone Number
                        </Label>
                        <div className="relative">
                            <Smartphone className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <Input
                                id="phone"
                                type="tel" // Triggers numeric keypad on mobile
                                placeholder="09XXXXXXXXX"
                                className={`h-11 bg-gray-50/50 pl-11 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                value={data.phone}
                                autoFocus
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                        {/* Inline Validation Error */}
                        {errors.phone && <p className="animate-pulse text-sm font-medium text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Action Button */}
                    <Button
                        type="submit"
                        disabled={processing || !data.phone}
                        className="h-11 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md transition-all hover:from-red-600 hover:to-orange-600 hover:shadow-lg disabled:opacity-70"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending Code...
                            </>
                        ) : (
                            'Send Reset Code'
                        )}
                    </Button>
                </form>

                {/* === Footer / Back Link === */}
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            }
                        }}
                        // Assuming you have a named route for login
                        className="gap-2 pl-0 transition-colors hover:bg-transparent hover:text-blue-600"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to log in
                    </Button>
                </div>
            </div>
        </div>
    );
}
