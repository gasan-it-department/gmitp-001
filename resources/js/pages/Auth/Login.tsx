import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
    user_identifier: string;
    password: string;
    remember_me: boolean;
};

interface LoginFormProps {
    onLoggedIn: (redirectionLink: string) => void;
}

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { currentMunicipality } = useMunicipality();

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            const response = await AuthApi.login(currentMunicipality.slug, data);

            // onLoggedIn(response.data.redirect_to);
        } catch (error: any) {
            if (error.response?.data) {
                const { errors: validationErrors, message } = error.response.data;

                // Handle field-specific validation errors
                if (validationErrors) {
                    Object.keys(validationErrors).forEach((field) => {
                        setError(field as keyof FormData, {
                            type: 'server',
                            message: validationErrors[field][0], // show first message
                        });
                    });
                }

                // Handle general errors (invalid credentials, invalid password, etc.)
                if (message && !validationErrors) {
                    setError('user_identifier', { type: 'server', message });
                    // or create a separate "root" error
                }
            }
        }
    };

    const togglePassword = () => {
        setShowPassword((prev: any) => !prev);
    };

    return (
        <div className="overflow-hidden p-1">
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={isSubmitting}>
                    <div className="flex flex-col gap-6">
                        {/* USER IDENTIFIER */}
                        <div className="grid gap-3">
                            <Label htmlFor="user_identifier" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                Username or Phone
                            </Label>
                            <Input
                                id="user_identifier"
                                type="text"
                                {...register('user_identifier', {
                                    required: 'Username or Phone is required',
                                })}
                            />
                            {errors.user_identifier && <p className="text-sm font-medium text-red-500">{errors.user_identifier.message}</p>}
                        </div>

                        {/* PASSWORD */}
                        <div className="grid gap-3">
                            <div className="flex items-center">
                                <Label htmlFor="password" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                    Password
                                </Label>

                                <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                                    Forgot your password?
                                </a>
                            </div>

                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password', { required: 'Password is required' })}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm font-medium text-red-500">{errors.password.message}</p>}
                        </div>

                        {/* REMEMBER ME */}
                        <div className="flex items-center gap-2">
                            <Controller
                                name="remember_me"
                                control={control}
                                defaultValue={false}
                                render={({ field: { value, onChange } }) => <Switch id="remember_me" checked={value} onCheckedChange={onChange} />}
                            />
                            <Label htmlFor="remember_me" className="cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                                Remember me
                            </Label>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-orange-500" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </Button>
                    </div>
                </fieldset>
            </form>
        </div>
    );
}
