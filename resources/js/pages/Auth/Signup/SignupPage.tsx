import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import api from '@/lib/axios';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface FormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface FormErrors {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
}

export default function SignupPage() {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [data, setData] = useState<FormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear the field error as the user types
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await api.post(
                '/api/auth/store-account',
                {
                    first_name: data.first_name,
                    middle_name: data.middle_name || null,
                    last_name: data.last_name,
                    phone: data.phone,
                    email: data.email || null,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                },
                {
                    headers: {
                        'X-Municipality-Slug': currentMunicipality.slug,
                    },
                },
            );

            toast.success('Account created! Please verify your phone number.');
            router.visit(response.data.redirect ?? '/');
        } catch (error: any) {
            // 422 field errors are handled by the axios interceptor toast,
            // but we also surface them inline on the form fields.
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                const mapped: FormErrors = {};
                Object.keys(serverErrors).forEach((key) => {
                    mapped[key as keyof FormErrors] = serverErrors[key][0];
                });
                setErrors(mapped);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
            <Head title="Create Account" />

            {/* Main Card */}
            <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:flex-row">
                {/* Left: Form */}
                <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
                        <p className="mt-2 text-sm text-gray-500">Register with {currentMunicipality?.name ?? 'your municipality'}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* First Name */}
                            <div>
                                <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="first_name"
                                    type="text"
                                    value={data.first_name}
                                    onChange={set('first_name')}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                    placeholder="Juan"
                                    required
                                />
                                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="last_name"
                                    type="text"
                                    value={data.last_name}
                                    onChange={set('last_name')}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                    placeholder="dela Cruz"
                                    required
                                />
                                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Middle Name */}
                        <div>
                            <label htmlFor="middle_name" className="mb-1 block text-sm font-medium text-gray-700">
                                Middle Name <span className="text-xs text-gray-400">(optional)</span>
                            </label>
                            <input
                                id="middle_name"
                                type="text"
                                value={data.middle_name}
                                onChange={set('middle_name')}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                placeholder="Santos"
                            />
                            {errors.middle_name && <p className="mt-1 text-xs text-red-500">{errors.middle_name}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={set('phone')}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                placeholder="09171234567"
                                maxLength={11}
                                required
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                Email Address <span className="text-xs text-gray-400">(optional)</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={set('email')}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                placeholder="juan@gmail.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={set('password')}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                    placeholder="Min. 8 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-gray-700">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={set('password_confirmation')}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm transition-colors focus:border-black focus:ring-2 focus:ring-black"
                                    placeholder="Re-enter your password"
                                    required
                                />
                            </div>
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-black py-2.5 font-medium text-white transition-all hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href={`/${currentMunicipality?.slug}/login`} className="font-medium text-black hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Right: Image Placeholder */}
                <div className="relative hidden w-1/2 bg-gray-100 md:block">
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

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
                By registering, you agree to our
                <a href="/terms" className="underline hover:text-gray-700">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="underline hover:text-gray-700">
                    Privacy Policy
                </a>
                .
            </div>
        </div>
    );
}
