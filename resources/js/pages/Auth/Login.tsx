import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AuthApi } from '@/Core/Api/Auth/AuthApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
    user_identifier: string;
    password: string;
    remember_me: boolean;
};

interface LoginFormProps {
    onClose?: () => void;
    onForgotPasswordClick?: () => void;
}

export default function LoginForm({ onClose, onForgotPasswordClick }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
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
            // API handles redirection/reload internally
            await AuthApi.login(currentMunicipality.slug, data);
            setIsRedirecting(true);
        } catch (error: any) {
            if (error.response?.data) {
                const { errors: validationErrors, message } = error.response.data;
                if (validationErrors) {
                    Object.keys(validationErrors).forEach((field) => {
                        setError(field as keyof FormData, {
                            type: 'server',
                            message: validationErrors[field][0],
                        });
                    });
                }
                if (message && !validationErrors) {
                    setError('user_identifier', { type: 'server', message });
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col justify-between sm:block">
            <div className="space-y-5 py-2">
                {/* USER IDENTIFIER */}
                <div className="space-y-2">
                    <Label htmlFor="user_identifier" className="text-sm font-medium">
                        Username or Phone
                    </Label>
                    <div className="relative">
                        <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="user_identifier"
                            placeholder=""
                            className={`pl-9 ${errors.user_identifier ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            {...register('user_identifier', { required: 'Username or Phone is required' })}
                        />
                    </div>
                    {errors.user_identifier && <p className="animate-pulse text-xs font-medium text-destructive">{errors.user_identifier.message}</p>}
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>

                        <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                            onClick={() => {
                                if (onForgotPasswordClick) {
                                    onForgotPasswordClick();
                                }
                            }}
                        >
                            Forgot password?
                        </Button>
                    </div>

                    <div className="relative">
                        <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`pr-10 pl-9 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            {...register('password', { required: 'Password is required' })}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2.5 right-3 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="animate-pulse text-xs font-medium text-destructive">{errors.password.message}</p>}
                </div>

                {/* REMEMBER ME */}
                <div className="flex items-center space-x-2 pb-5">
                    <Controller
                        name="remember_me"
                        control={control}
                        defaultValue={false}
                        render={({ field: { value, onChange } }) => (
                            <Switch
                                id="remember_me"
                                checked={value}
                                onCheckedChange={onChange}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-orange-500"
                            />
                        )}
                    />
                    <Label htmlFor="remember_me" className="cursor-pointer text-sm font-normal select-none">
                        Keep me logged in
                    </Label>
                </div>
            </div>

            {/* ACTION BUTTON */}

            <div className="flex gap-3 pb-5">
                {/* Cancel Button (hidden on desktop) */}
                <Button
                    disabled={isSubmitting}
                    type="button"
                    className="h-11 flex-1 border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100 md:hidden"
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
                    type="submit"
                    disabled={isSubmitting || isRedirecting}
                    className="h-11 flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white"
                >
                    {isSubmitting || isRedirecting ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            {isRedirecting ? 'Redirecting...' : 'Logging in...'}
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </div>
        </form>
    );
}
