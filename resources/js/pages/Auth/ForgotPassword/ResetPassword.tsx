import InputError from '@/components/Input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    phone: string;
}

export default function ResetPassword({ phone }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: phone,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // 🚀 CRITICAL: We post to the CURRENT URL (window.location.href).
        // Why? Because the current URL contains the "?signature=..." query param.
        // If we post to a clean URL like '/reset-password', the signature is lost
        // and the middleware will block the request (403 Forbidden).
        post(window.location.href, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Head title="Reset Password" />

            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">Reset Password</h2>
                <p className="mb-6 text-center text-sm text-gray-500">
                    Create a new password for <span className="font-mono font-bold">{phone}</span>
                </p>

                <form onSubmit={submit} className="space-y-4">
                    {/* Phone (Hidden but visually confirmed above) */}

                    {/* New Password */}
                    <div>
                        <Label htmlFor="password_confirmation">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                        <Button className="w-full justify-center" disabled={processing}>
                            {processing ? 'Reseting...' : 'Reset Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
