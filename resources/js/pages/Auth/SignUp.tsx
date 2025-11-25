import InputError from '@/components/Input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Eye, EyeOff } from 'lucide-react';
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

interface RegisterPageProps {
    onSignedIn: () => void;
}

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
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
    const [isSigningIn, setIsSigningIn] = useState(false);
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
            setIsSigningIn(true);

            const response = await AuthApi.storeAccount(currentMunicipality.slug, data);

            console.log('Registration successful', response.data);
            reset();
        } catch (error: any) {
            setIsSigningIn(false);
            const backendMessage =
                error.response?.data?.message || error.response?.data?.errors || error.message || 'An unexpected error occurred during registration.';

            setClassicDialog((prev) => ({
                ...prev,
                title: 'Oops! Something went wrong.',
                positiveButtonText: 'OK',
                isNegativeButtonHidden: true,
                message: JSON.stringify(backendMessage, null, 2),
                isDialogShowing: true,
            }));
        }
    };

    return (
        <div className="p-1">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* First Name */}
                    <div className="grid gap-3">
                        <Label htmlFor="first_name">
                            First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            {...register('first_name', { required: 'First name is required.' })}
                            className={errors.first_name ? 'border-destructive' : ''}
                        />
                        {errors.first_name && <InputError message={errors.first_name.message} />}
                    </div>

                    {/* Middle Name (Optional) */}
                    <div className="grid gap-3">
                        <Label htmlFor="middle_name">
                            Middle Name <span className="text-gray-500">(Optional)</span>
                        </Label>
                        <Input id="middle_name" {...register('middle_name')} className={errors.middle_name ? 'border-destructive' : ''} />
                        {errors.middle_name && <InputError message={errors.middle_name.message} />}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Last Name */}
                    <div className="grid gap-3">
                        <Label htmlFor="last_name">
                            Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            {...register('last_name', { required: 'Last name is required.' })}
                            className={errors.last_name ? 'border-destructive' : ''}
                        />
                        {errors.last_name && <InputError message={errors.last_name.message} />}
                    </div>

                    {/* Phone (Required) */}
                    <div className="grid gap-3">
                        <Label htmlFor="phone">
                            Phone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            placeholder="0900-000-0000"
                            {...register('phone', {
                                required: 'Phone number is required.',
                                pattern: {
                                    value: /^(\+?\d{10,13})$/,
                                    message: 'Invalid phone number format.',
                                },
                            })}
                            className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && <InputError message={errors.phone.message} />}
                    </div>
                </div>

                {/* Username */}
                <div className="grid gap-3">
                    <Label htmlFor="user_name">
                        Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="user_name"
                        {...register('user_name', { required: 'Username is required.' })}
                        className={errors.user_name ? 'border-destructive' : ''}
                    />
                    {errors.user_name && <InputError message={errors.user_name.message} />}
                </div>

                {/* Password */}
                <div className="grid gap-3">
                    <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password', {
                                required: 'Password is required.',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters.',
                                },
                            })}
                            autoComplete="off"
                            className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                        >
                            {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <InputError message={errors.password.message} />}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-3">
                    <Label htmlFor="password_confirmation">
                        Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="password_confirmation"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password_confirmation', {
                            required: 'Please confirm your password.',
                            validate: (value) => value === watch('password') || 'Passwords do not match.',
                        })}
                        className={errors.password_confirmation ? 'border-destructive' : ''}
                        autoComplete="off"
                    />
                    {errors.password_confirmation && <InputError message={errors.password_confirmation.message} />}
                </div>

                <Button disabled={isSigningIn} type="submit" className="mt-2 w-full bg-gradient-to-r from-red-500 to-orange-500">
                    {isSigningIn ? 'Please wait...' : 'Create Account'}
                </Button>
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
