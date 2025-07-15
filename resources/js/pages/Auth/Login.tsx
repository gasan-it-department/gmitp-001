import Input from '@/components/Auth/Input';
import TextLink from '@/components/ui/TextLink';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AuthLayout from '@/layouts/AuthLayoutTemplate';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your User Name and password below to log in">
            {/* <Head title="Log in" /> */}
            <form className="">
                <div className="group relative z-0 mb-5 w-full">
                    <Input label="User Name" />
                </div>

                <div className="mt-9 mb-9" />

                <div className="group relative z-0 mb-5 w-full">
                    <Input label="Password" type={showPassword ? 'text' : 'password'} />

                    <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                    >
                        {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                </div>

                <div className="mt-9 mb-9" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Switch>Hello</Switch>
                        <label htmlFor="terms" className="ml-2 cursor-pointer text-sm text-gray-900 dark:text-gray-300">
                            Remember me
                        </label>
                    </div>
                    <div className="flex justify-end">
                        <a href="#" className="text-[12px] text-black hover:text-black hover:underline">
                            Forgotten Password?
                        </a>
                    </div>
                </div>

                <Button type="submit" className="mt-10 w-full" tabIndex={4} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Log in
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <TextLink href={route('register')} tabIndex={5}>
                    Sign up
                </TextLink>
            </div>
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
