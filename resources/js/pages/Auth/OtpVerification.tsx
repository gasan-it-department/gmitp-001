import { verify } from '@/actions/App/External/Api/Controllers/Auth/VerifiyPhoneController';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import resend from '@/routes/resend';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

// Optional: Pass the masked phone number from the backend
interface Props {
    phoneNumber?: string;
    secondsRemaining: number;
}

export default function OtpVerification({ secondsRemaining, phoneNumber }: Props) {
    // destructure 'post' from useForm to handle submission automatically
    const { data, setData, post, processing, errors, reset } = useForm({
        otp: '',
    });
    // 1. Timer Logic for Resend
    const [timeLeft, setTimeLeft] = useState(secondsRemaining);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // Stop if we are already at 0
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        // Ensure button is hidden while counting
        setCanResend(false);

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    setCanResend(true); // Enable the button immediately when we hit 0
                    return 0;
                }
                // FIX: This return statement must be INSIDE the braces
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleResend = () => {
        router.post(resend.otp.url());

        console.log('Resending code...');
        setTimeLeft(secondsRemaining);
        setCanResend(false);
        reset('otp');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // FIX: Use the 'post' helper from useForm.
        // It automatically sends the 'data' object.
        // Ensure you have this named route in your web.php: Route::post('/verify-otp', ...)->name('otp.verify');
        post(verify.url(), {
            onFinish: () => reset('otp'), // Optional: clear input on failure/finish
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Head title="Verify Phone Number" />

            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
                {/* Header Section */}
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Verify your phone</h2>
                    {phoneNumber && (
                        <p className="mt-2 text-sm text-gray-500">
                            We sent a 6-digit code to <span className="font-semibold text-gray-900">{phoneNumber}</span>.
                            <br />
                            Enter it below to confirm your identity.
                        </p>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* OTP Input Section */}
                    <div className="flex justify-center">
                        <InputOTP maxLength={6} value={data.otp} onChange={(value) => setData('otp', value)}>
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

                    {/* Error Message */}
                    {errors.otp && <p className="text-center text-sm font-medium text-red-500">{errors.otp}</p>}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white"
                        disabled={processing || data.otp.length < 6}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Account'
                        )}
                    </Button>
                </form>

                {/* Resend Section */}
                <div className="text-center text-sm">
                    <p className="text-gray-500">
                        Didn't receive the code?{' '}
                        {canResend ? (
                            <button onClick={handleResend} className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                                Resend Code
                            </button>
                        ) : (
                            <span className="font-medium text-gray-400">Resend in {timeLeft}s</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
