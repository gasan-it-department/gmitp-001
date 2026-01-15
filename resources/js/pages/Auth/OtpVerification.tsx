import { update } from '@/actions/App/External/Api/Controllers/Auth/UpdatePhoneController';
import { verify } from '@/actions/App/External/Api/Controllers/Auth/VerifiyPhoneController';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import resend from '@/routes/resend';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Loader2, Pencil, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    phoneNumber?: string;
    secondsRemaining: number;
}

export default function OtpVerification({ secondsRemaining, phoneNumber }: Props) {
    // --- 1. OTP Submission Form ---
    const {
        data: otpData,
        setData: setOtpData,
        post: postOtp,
        processing: otpProcessing,
        errors: otpErrors,
        reset: resetOtp,
    } = useForm({
        otp: '',
    });

    // --- 2. Update Phone Number Form (New) ---
    // This handles the "Oops, wrong number" scenario
    const updatePhoneForm = useForm({
        phone: phoneNumber || '',
    });

    const [timeLeft, setTimeLeft] = useState(secondsRemaining);
    const [canResend, setCanResend] = useState(false);

    // Toggle for the "Edit Number" mode
    const [isEditing, setIsEditing] = useState(false);

    // --- Timer Logic ---
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        setCanResend(false);

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    setCanResend(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    // --- Handlers ---

    const handleResend = () => {
        router.post(
            resend.otp.url(),
            {},
            {
                onStart: () => console.log('Resending code...'),
                onFinish: () => {
                    setTimeLeft(60);
                    setCanResend(false);
                    resetOtp('otp');
                },
            },
        );
    };

    const handleUpdatePhone = (e: React.FormEvent) => {
        e.preventDefault();

        // Connects to your Route::put('/update/phone-number')
        updatePhoneForm.put(update.url(), {
            onSuccess: () => {
                setIsEditing(false);
                // Reset timer because a new code is sent to the new number
                setTimeLeft(60);
                setCanResend(false);
                resetOtp('otp');
            },
        });
    };

    const submitOtp = (e: React.FormEvent) => {
        e.preventDefault();
        postOtp(verify.url(), {
            onFinish: () => resetOtp('otp'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Head title="Verify Phone Number" />

            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
                {/* --- HEADER SECTION --- */}
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Verify your phone</h2>

                    {/* --- INLINE EDIT SECTION --- */}
                    {/* This replaces the static text with a dynamic toggle */}
                    <div className="mt-3 flex min-h-[40px] flex-col items-center justify-center">
                        {!isEditing ? (
                            // MODE A: VIEWING
                            <div className="group flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100">
                                <span>Code sent to</span>
                                <span className="font-semibold text-gray-900">{updatePhoneForm.data.phone || phoneNumber}</span>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="ml-1 p-1 text-gray-400 transition-colors group-hover:text-blue-600"
                                    title="Edit phone number"
                                    type="button"
                                >
                                    <Pencil size={14} />
                                </button>
                            </div>
                        ) : (
                            // MODE B: EDITING
                            <form onSubmit={handleUpdatePhone} className="flex items-center gap-2 duration-200 animate-in fade-in zoom-in-95">
                                <input
                                    type="text"
                                    value={updatePhoneForm.data.phone}
                                    onChange={(e) => updatePhoneForm.setData('phone', e.target.value)}
                                    className="h-9 w-40 rounded-md border border-gray-300 px-3 text-center font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="0912..."
                                    autoFocus
                                />

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={updatePhoneForm.processing}
                                    className="flex h-9 w-9 items-center justify-center rounded-md bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                    title="Save new number"
                                >
                                    {updatePhoneForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                                </button>

                                {/* Cancel Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        updatePhoneForm.reset();
                                    }}
                                    className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    title="Cancel"
                                >
                                    <X size={16} />
                                </button>
                            </form>
                        )}

                        {/* Validation Errors for Phone Update */}
                        {updatePhoneForm.errors.phone && (
                            <p className="mt-2 animate-pulse text-xs font-medium text-red-500">{updatePhoneForm.errors.phone}</p>
                        )}
                    </div>
                </div>

                {/* --- OTP FORM SECTION --- */}
                <form onSubmit={submitOtp} className="space-y-6">
                    <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otpData.otp} onChange={(value) => setOtpData('otp', value)}>
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

                    {/* OTP Error Message */}
                    {otpErrors.otp && <p className="text-center text-sm font-medium text-red-500">{otpErrors.otp}</p>}

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md transition-opacity hover:opacity-90"
                        disabled={otpProcessing || otpData.otp.length < 6}
                    >
                        {otpProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Account'
                        )}
                    </Button>
                </form>

                {/* --- RESEND SECTION --- */}
                <div className="text-center text-sm">
                    <p className="text-gray-500">
                        Didn't receive the code?{' '}
                        {canResend ? (
                            <button onClick={handleResend} className="font-semibold text-blue-600 transition-all hover:text-blue-500 hover:underline">
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
