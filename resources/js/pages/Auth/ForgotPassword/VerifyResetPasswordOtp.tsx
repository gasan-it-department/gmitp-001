import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import password from '@/routes/password';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    phone: string;
    initialSecondsRemaining: number;
}

export default function VerifyResetPasswordOtp({ phone, initialSecondsRemaining }: Props) {
    // 1. Setup Form

    console.log(initialSecondsRemaining);
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: phone, // Pass phone back to the server for verification
        otp: '',
    });

    // 2. Timer Logic (Clean & Reusable)
    const [timeLeft, setTimeLeft] = useState(initialSecondsRemaining);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        setCanResend(false);
        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    // 3. Handlers
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Route to: Route::post('/forgot-password/verify', ...)
        (post(password.otp.submit.url()),
            {
                onFinish: () => reset('otp'),
            });
    };

    const handleResend = () => {
        // Route to: Route::post('/forgot-password', ...) -> The same one that initiated it
        post(password.phone.url(), {
            preserveScroll: true,
            onSuccess: () => setTimeLeft(60), // Reset timer visually on success
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Head title="Verify Code" />

            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-gray-200/50">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                        <MessageSquareText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Check your phone</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        We sent a 6-digit code to <span className="font-semibold text-gray-900">{phone}</span>.
                        <br />
                        Enter it below to reset your password.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-8">
                    <div className="flex justify-center">
                        <InputOTP maxLength={6} value={data.otp} onChange={(val) => setData('otp', val)}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                                <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                                <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                                <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                                <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    {errors.otp && <p className="animate-pulse text-center text-sm font-medium text-red-500">{errors.otp}</p>}

                    <Button
                        type="submit"
                        disabled={processing || data.otp.length < 6}
                        className="h-11 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md transition-all hover:from-red-600 hover:to-orange-600 hover:shadow-lg disabled:opacity-70"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </Button>
                </form>

                {/* Resend Logic */}
                <div className="text-center text-sm">
                    <p className="text-gray-500">
                        Didn't receive the code?{' '}
                        {canResend ? (
                            <button type="button" onClick={handleResend} className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                                Resend Code
                            </button>
                        ) : (
                            <span className="font-medium text-gray-400 select-none">Resend in {timeLeft}s</span>
                        )}
                    </p>
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <Link
                        href={password.request()} // Go back to enter phone again
                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Change phone number
                    </Link>
                </div>
            </div>
        </div>
    );
}
