import InputError from '@/components/Input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Eye, EyeOff, Lock, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ClassicDialog from '../Utility/ClassicDialog';

interface RegisterFormValues {
    first_name: string;
    middle_name?: string;
    last_name: string;
    phone: string;
    user_name: string;
    password: string;
    password_confirmation: string;
}

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        watch,
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
        },
    });

    const { currentMunicipality } = useMunicipality();
    const [showPassword, setShowPassword] = useState(false);
    const [classicDialog, setClassicDialog] = useState({
        isDialogShowing: false,
        isNegativeButtonHidden: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
    });

    const togglePassword = () => setShowPassword((prev) => !prev);

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            // API handles the redirection internally
            await AuthApi.storeAccount(currentMunicipality.slug, data);
        } catch (error: any) {
            const backendMessage =
                error.response?.data?.message || error.response?.data?.errors || error.message || 'An unexpected error occurred during registration.';

            setClassicDialog((prev) => ({
                ...prev,
                title: 'Registration Failed',
                positiveButtonText: 'Dismiss',
                isNegativeButtonHidden: true,
                message: JSON.stringify(backendMessage, null, 2),
                isDialogShowing: true,
            }));
        }
    };

    return (
        <div className="h-full p-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* LAYOUT GRID SYSTEM:
                    grid-cols-1 (Mobile)
                    md:grid-cols-2 (PC/Tablet)
                */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="first_name">
                            First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            placeholder="Juan"
                            {...register('first_name', { required: 'First name is required.' })}
                            className={errors.first_name ? 'border-destructive' : ''}
                        />
                        {errors.first_name && <InputError message={errors.first_name.message} />}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="last_name">
                            Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            placeholder="Dela Cruz"
                            {...register('last_name', { required: 'Last name is required.' })}
                            className={errors.last_name ? 'border-destructive' : ''}
                        />
                        {errors.last_name && <InputError message={errors.last_name.message} />}
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2">
                        <Label htmlFor="middle_name">
                            Middle Name <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <Input
                            id="middle_name"
                            placeholder="Santos"
                            {...register('middle_name')}
                            className={errors.middle_name ? 'border-destructive' : ''}
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Phone className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                placeholder="09123456789"
                                className={`pl-9 ${errors.phone ? 'border-destructive' : ''}`}
                                {...register('phone', {
                                    required: 'Phone number is required.',
                                    pattern: {
                                        value: /^(\+?\d{10,13})$/,
                                        message: 'Invalid phone number format.',
                                    },
                                })}
                            />
                        </div>
                        {errors.phone && <InputError message={errors.phone.message} />}
                    </div>

                    {/* Username - Spans full width on PC for visual break */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="user_name">
                            Username <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="user_name"
                                placeholder="juandelacruz23"
                                className={`pl-9 ${errors.user_name ? 'border-destructive' : ''}`}
                                {...register('user_name', { required: 'Username is required.' })}
                            />
                        </div>
                        {errors.user_name && <InputError message={errors.user_name.message} />}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`pr-10 pl-9 ${errors.password ? 'border-destructive' : ''}`}
                                {...register('password', {
                                    required: 'Password is required.',
                                    minLength: { value: 8, message: 'Min 8 characters.' },
                                })}
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <InputError message={errors.password.message} />}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`pl-9 ${errors.password_confirmation ? 'border-destructive' : ''}`}
                                {...register('password_confirmation', {
                                    required: 'Confirm your password.',
                                    validate: (value) => value === watch('password') || 'Passwords do not match.',
                                })}
                            />
                        </div>
                        {errors.password_confirmation && <InputError message={errors.password_confirmation.message} />}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        disabled={isSubmitting}
                        type="submit"
                        className="h-11 w-full transform bg-gradient-to-r from-red-500 to-orange-500 text-base font-medium text-white shadow-md transition-all duration-300 ease-in-out hover:from-red-600 hover:to-orange-600 active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </div>
            </form>

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                positiveButtonText={classicDialog.positiveButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                open={classicDialog.isDialogShowing}
                onPositiveClick={() => setClassicDialog((prev) => ({ ...prev, isDialogShowing: false }))}
            />
        </div>
    );
}
