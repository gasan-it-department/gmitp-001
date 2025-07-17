import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-errror';
import Input from '@/components/ui/input-floating';
import TextLink from '@/components/ui/text-link';
import AuthLayout from '@/layouts/AuthLayoutTemplate';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';

export default function RegisterPage() {
    type RegisterFormData = {
        user_name: string;
        phone: string;
        password: string;
        password_confirmation: string;
    };

    const { data, setData, post, processing, errors } = useForm<RegisterFormData>({
        user_name: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });
    console.log(data);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/store-account');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(e.target.name as keyof RegisterFormData, e.target.value);
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev: any) => !prev);
    };

    const handleRegisterPhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        const numericValue = value.replace(/\D/g, '');
        if (numericValue === '' || /^0[0-9]*$/.test(numericValue)) {
            setData('phone', numericValue);
        }
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            {/* <Head title="Register" /> */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-10">
                    <div className="grid gap-2">
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={data.phone}
                            onChange={handleRegisterPhoneInput}
                            inputMode="numeric"
                            tabIndex={1}
                            disabled={processing}
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Input
                            label="User Name"
                            name="user_name"
                            type="text"
                            value={data.user_name}
                            onChange={(e) => setData('user_name', e.target.value)}
                            required
                            tabIndex={2}
                            disabled={processing}
                        />
                        <InputError message={errors.user_name} />
                    </div>

                    <div className="relative grid gap-2">
                        <Input
                            label="Password"
                            name="password"
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                        >
                            {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>

                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Input
                            label="Confirm Password"
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
