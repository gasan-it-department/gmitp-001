import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import axios from '@/lib/axios';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
    user_identifier: string;
    password: string;
    remember_me: boolean;
};

export default function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            const response = await axios.post('/login', data, {
                withCredentials: true,
            });

            if (response.data.redirect_to) {
                window.location.href = response.data.redirect_to;
            }
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
    return (
        <div className="overflow-hidden p-1">
            {/* Show error alert if any field has errors */}
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="absolute top-10 left-1/2 z-20 mb-4 w-full max-w-md -translate-x-1/2 transform bg-white">
                    Please check the form fields and try again.
                </Alert>
            )}

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
                            <Input id="password" type="password" {...register('password', { required: 'Password is required' })} />
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
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </Button>
                    </div>
                </fieldset>
            </form>
        </div>
    );
}
