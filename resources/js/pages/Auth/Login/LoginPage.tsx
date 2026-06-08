import { FlashHandler } from '@/components/Shared/FlashHandler';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { PasswordInput } from '@/pages/UserManagement/Profile/Components/PasswordInput';
import ToastProvider from '@/pages/Utility/ToastShower';
import { home, login } from '@/routes';
import { social } from '@/routes/login';
import signup from '@/routes/signup';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useGoogleLogin } from '@react-oauth/google';
import { ChevronLeft } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    // Shared by SetMunicipalityContext middleware on the /{municipality}/login route
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    // Inertia's built-in form helper
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        user_identifier: '', // Matches backend LoginRequest
        password: '',
        remember_me: false as boolean,
    });

    const isBusy = processing || isSocialLoading;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isBusy) return;
        clearErrors();

        post(login.url(), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                toast.success('Successfully logged in!');
            },
            onError: (errors) => {
                toast.error('Login failed. Please check your credentials.');
            },
        });
    };

    /**
     * Handles the Google Social Login API call.
     */
    const handleGoogleLogin = async (googleAccessToken: string) => {
        setIsSocialLoading(true);
        try {
            const response = await api.post(
                social.url(),
                {
                    provider: 'google',
                    access_token: googleAccessToken,
                },
                {
                    headers: {
                        'X-Municipality-Slug': currentMunicipality.slug,
                    },
                },
            );

            if (response.data.success) {
                toast.success('Successfully logged in with Google!');
                router.visit(response.data.redirect ?? '/');
            }
        } catch (error: any) {
            console.error('Google login failed', error);
            toast.error('Social Login Failed', {
                description: error.response?.data?.message || 'Could not authenticate with Google.',
            });
        } finally {
            setIsSocialLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => handleGoogleLogin(tokenResponse.access_token),
        onError: () => toast.error('Google Auth Failed'),
    });

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
            <Head title="Log in" />

            {/* Main Card Container */}
            <div
                className={cn(
                    'flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all md:flex-row',
                    isBusy && 'opacity-90 grayscale-[0.2]',
                )}
            >
                {/* Left Side: Form Section */}
                <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2">
                    <Link
                        href={isBusy ? '#' : home.url({ municipality: currentMunicipality.slug })}
                        className={cn(
                            'group mb-6 flex w-fit items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-black',
                            isBusy && 'pointer-events-none opacity-50',
                        )}
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Back
                    </Link>

                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="mt-2 text-sm text-gray-500">Login to your account</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email or Mobile Input */}
                        <div>
                            <label htmlFor="user_identifier" className="mb-1 block text-sm font-medium text-gray-700">
                                Email or Mobile Number
                            </label>
                            <input
                                id="user_identifier"
                                type="text"
                                name="user_identifier"
                                value={data.user_identifier}
                                onChange={(e) => setData('user_identifier', e.target.value)}
                                disabled={isBusy}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-black focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                placeholder="e.g. 09171234567 or email@domain.com"
                                required
                            />
                            {errors.user_identifier && <p className="mt-1 text-xs text-red-500">{errors.user_identifier}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className={cn(
                                        'text-sm text-gray-600 transition-colors hover:text-black hover:underline',
                                        isBusy && 'pointer-events-none opacity-50',
                                    )}
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full"
                                placeholder="••••••••"
                                required
                                error={errors.password}
                                disabled={isBusy}
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2">
                            <input
                                id="remember_me"
                                type="checkbox"
                                checked={data.remember_me}
                                onChange={(e) => setData('remember_me', e.target.checked)}
                                disabled={isBusy}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50"
                            />
                            <label htmlFor="remember_me" className="text-sm text-gray-600">
                                Keep me logged in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isBusy}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 font-medium text-white transition-all hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
                        >
                            {processing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                            {processing ? 'Signing in...' : 'Login'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 flex items-center justify-between">
                        <span className="w-1/5 border-b lg:w-1/4"></span>
                        <span className="text-center text-xs text-gray-500 uppercase">Or continue with</span>
                        <span className="w-1/5 border-b lg:w-1/4"></span>
                    </div>

                    {/* Google OAuth Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => loginWithGoogle()}
                            disabled={isBusy}
                            type="button"
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            {isSocialLoading ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            Google
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href={signup.show.url(currentMunicipality.slug)}
                            className={cn('font-medium text-black hover:underline', isBusy && 'pointer-events-none opacity-50')}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Right Side: Image Placeholder (Hidden on Mobile) */}
                <div className="relative hidden w-1/2 bg-gray-100 md:block">
                    {/* You can replace this img tag with a beautiful picture of Gasan / Marinduque */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Footer Legal Text */}
            <div className="mt-8 text-center text-xs text-gray-500">
                By clicking continue, you agree to our{' '}
                <a href="#" className="underline hover:text-gray-700">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-gray-700">
                    Privacy Policy
                </a>
                .
            </div>
            <FlashHandler />
            <ToastProvider position="top-center" />
        </div>
    );
}
