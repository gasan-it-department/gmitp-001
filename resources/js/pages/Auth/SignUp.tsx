import Auth from '@/actions/App/External/Api/Controllers/Auth';
import InputError from '@/components/Input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ClassicDialog from '../Utility/ClassicDialog';

interface RegisterFormValues {
    [key: string]: any;
    first_name: string;
    middle_name?: string;
    last_name: string;
    phone: string;
    user_name: string;
    password: string;
    password_confirmation: string;
}

interface SignUpPageProps {
    onClose?: () => void;
}

export default function RegisterPage({ onClose }: SignUpPageProps) {
    const { currentMunicipality } = useMunicipality();
    const [showPassword, setShowPassword] = useState(false);

    // Dialog state for critical failures (optional)
    const [classicDialog, setClassicDialog] = useState({
        isDialogShowing: false,
        title: '',
        message: '',
    });

    const {
        register,
        handleSubmit,
        setError,
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

    const togglePassword = () => setShowPassword((prev) => !prev);

    const onSubmit = (data: RegisterFormValues) => {
        const postUrl = Auth.CreateUserController.createUser.url();

        router.post(
            postUrl,
            data, // 👈 No more red squiggly line!
            {
                headers: {
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
                onError: (serverErrors) => {
                    Object.keys(serverErrors).forEach((key) => {
                        setError(key as any, {
                            type: 'server',
                            message: serverErrors[key],
                        });
                    });
                },
                onSuccess: () => {
                    if (onClose) onClose();
                },
            },
        );
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
                                placeholder="eg: 09123456789"
                                {...register('phone', {
                                    required: 'Phone is required.',
                                })}
                            />
                        </div>
                        {errors.phone && <InputError message={errors.phone.message} />}
                    </div>

                    {/* Username */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>Username *</Label>
                        <div className="relative">
                            <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" {...register('user_name', { required: 'Username is required.' })} />
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
                                className="pr-10 pl-9"
                                {...register('password', { required: 'Password is required.', minLength: { value: 8, message: 'Min 8 chars.' } })}
                            />
                            <button type="button" onClick={togglePassword} className="absolute top-2.5 right-3">
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
                                    validate: (value) => value === watch('password') || 'Passwords do not match.',
                                })}
                            />
                        </div>
                        {errors.password_confirmation && <InputError message={errors.password_confirmation.message} />}
                    </div>
                </div>

                <div className="flex gap-3 pb-5">
                    {/* Cancel Button */}
                    <Button disabled={isSubmitting} type="button" variant="ghost" className="h-11 flex-1 md:hidden" onClick={onClose}>
                        Cancel
                    </Button>

                    {/* Submit Button */}
                    <Button disabled={isSubmitting} type="submit" className="h-11 flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                        {isSubmitting ? 'Creating Account…' : 'Create Account'}
                    </Button>
                </div>
            </form>

            {/* Critical Error Dialog */}
            <ClassicDialog
                open={classicDialog.isDialogShowing}
                title={classicDialog.title}
                message={classicDialog.message}
                positiveButtonText="Dismiss"
                hideNegativeButton={true}
                onPositiveClick={() => setClassicDialog((prev) => ({ ...prev, isDialogShowing: false }))}
            />
        </div>
    );
}
