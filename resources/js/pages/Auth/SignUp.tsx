import InputError from '@/components/Input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Eye, EyeOff, Lock, Phone, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ClassicDialog from '../Utility/ClassicDialog';
import { toast } from 'sonner';

interface RegisterFormValues {
    first_name: string;
    middle_name?: string;
    last_name: string;
    phone: string;
    user_name: string;
    password: string;
    password_confirmation: string;
    otp: string;
}

interface SignUpPageProps {
    onClose?: () => void;
}

export default function RegisterPage({ onClose }: SignUpPageProps) {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        clearErrors,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            phone: '',
            user_name: '',
            password: '',
            password_confirmation: '',
            otp: '',
        },
    });

    const { currentMunicipality } = useMunicipality();
    const [showPassword, setShowPassword] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    const [classicDialog, setClassicDialog] = useState({
        isDialogShowing: false,
        isNegativeButtonHidden: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
    });

    const togglePassword = () => setShowPassword((prev) => !prev);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (otpTimer > 0) {
            timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpTimer]);

    const handleSendOtp = async () => {
        const phone = watch('phone');

        if (!phone) {
            setClassicDialog({
                isDialogShowing: true,
                isNegativeButtonHidden: true,
                title: 'Phone Required',
                message: 'Please enter your phone number first.',
                positiveButtonText: 'OK',
                negativeButtonText: '',
            });
            return;
        }

        try {
            setIsSendingOtp(true);
            clearErrors('otp');
            let formattedPhone = phone;
            if (phone.startsWith('09')) {
                formattedPhone = '+63' + phone.substring(1);
            }
            if (phone.startsWith('9') && phone.length === 10) {
                formattedPhone = '+63' + phone;
            }

            // ======================================= SEND OTP ======================================= //
            // Use "formattedPhone" variable when integrating with backend
            // await AuthApi.sendOtp(currentMunicipality.slug, formattedPhone);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // SIMULATE API CALL

            setIsOtpSent(true);
            setOtpTimer(60); // 60 seconds cooldown
            toast.success(`OTP sent to ${formattedPhone}`);
        } catch (error: any) {
            setClassicDialog({
                isDialogShowing: true,
                isNegativeButtonHidden: true,
                title: 'OTP Failed',
                message: error.message || 'Failed to send OTP.',
                positiveButtonText: 'Dismiss',
                negativeButtonText: '',
            });
        } finally {
            setIsSendingOtp(false);
        }

    };

    const onSubmit = async (data: RegisterFormValues) => {
        try {

            // ======================================= VERIFY OTP ======================================= //

            try {
                // API must return verificationResponse object.
                // const verificationResponse = await AuthApi.verifyOtp(
                //     currentMunicipality.slug,
                //     data.phone,
                //     data.otp
                // );

                // if(!verificationResponse.isVerified) {
                //     throw new Error(verificationResponse.message);
                // }

                // ======== SAMPLE RESPONSE FORMAT ========
                // {
                //     "isVerified": true,
                //     "message": "OTP verified successfully."
                // }

                // {
                //     "isVerified": false,
                //     "message": "Invalid OTP."
                // }

                await new Promise((resolve) => setTimeout(resolve, 1000)); // SIMULATE API CALL
            } catch {
                setError('otp', {
                    type: 'manual',
                    message: 'Invalid or expired OTP.',
                });
                return;
            }

            // ======================================= CREATE ACCOUNT ======================================= //

            await AuthApi.storeAccount(currentMunicipality.slug, data);
            console.log('Account created successfully:', data);
        } catch (error: any) {
            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.errors ||
                error.message ||
                'An unexpected error occurred during registration.';

            setClassicDialog({
                isDialogShowing: true,
                isNegativeButtonHidden: true,
                title: 'Registration Failed',
                message: JSON.stringify(backendMessage, null, 2),
                positiveButtonText: 'Dismiss',
                negativeButtonText: '',
            });
        }
    };

    return (
        <div className="h-full p-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                    {/* First Name */}
                    <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input {...register('first_name', { required: 'First name is required.' })} />
                        {errors.first_name && <InputError message={errors.first_name.message} />}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input {...register('last_name', { required: 'Last name is required.' })} />
                        {errors.last_name && <InputError message={errors.last_name.message} />}
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2">
                        <Label>Middle Name (Optional)</Label>
                        <Input {...register('middle_name')} />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label>Phone *</Label>
                        <div className="relative">
                            <Phone className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                {...register('phone', { required: 'Phone is required.' })}
                            />
                        </div>
                        {errors.phone && <InputError message={errors.phone.message} />}
                    </div>

                    {/* OTP */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>One-Time Password OTP *</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter OTP"
                                maxLength={6}
                                disabled={!isOtpSent}
                                {...register('otp', {
                                    required: isOtpSent ? 'OTP is required.' : false,
                                })}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || otpTimer > 0}
                            >
                                {isSendingOtp
                                    ? 'Sending…'
                                    : otpTimer > 0
                                        ? `Resend in ${otpTimer}s`
                                        : isOtpSent
                                            ? 'Resend OTP'
                                            : 'Send OTP'}
                            </Button>
                        </div>

                        {isOtpSent && (
                            <p className="text-xs text-muted-foreground">
                                An OTP has been sent to your phone number.
                            </p>
                        )}

                        {errors.otp && <InputError message={errors.otp.message} />}
                    </div>

                    {/* Username */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>Username *</Label>
                        <div className="relative">
                            <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                {...register('user_name', { required: 'Username is required.' })}
                            />
                        </div>
                        {errors.user_name && <InputError message={errors.user_name.message} />}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label>Password *</Label>
                        <div className="relative">
                            <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                className="pl-9 pr-10"
                                {...register('password', { required: 'Password is required.' })}
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute top-2.5 right-3"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <InputError message={errors.password.message} />}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label>Confirm Password *</Label>
                        <div className="relative">
                            <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                className="pl-9"
                                {...register('password_confirmation', {
                                    required: 'Confirm password.',
                                    validate: (value) =>
                                        value === watch('password') || 'Passwords do not match.',
                                })}
                            />
                        </div>
                        {errors.password_confirmation && (
                            <InputError message={errors.password_confirmation.message} />
                        )}
                    </div>
                </div>

                <div className="pb-5 flex gap-3">
                    {/* Cancel Button (hidden on desktop) */}
                    <Button
                        disabled={isSubmitting}
                        type="button"
                        className="flex-1 h-11 border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100 md:hidden"
                        onClick={() => {
                            if (onClose !== undefined) {
                                onClose();
                            }
                        }}
                    >
                        Cancel
                    </Button>

                    {/* Submit Button */}
                    <Button
                        disabled={isSubmitting || !isOtpSent}
                        type="submit"
                        className="flex-1 h-11 bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    >
                        {isSubmitting ? 'Creating Account…' : 'Create Account'}
                    </Button>
                </div>

            </form>

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                positiveButtonText={classicDialog.positiveButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                open={classicDialog.isDialogShowing}
                onPositiveClick={() =>
                    setClassicDialog((prev) => ({ ...prev, isDialogShowing: false }))
                }
            />
        </div>
    );
}
