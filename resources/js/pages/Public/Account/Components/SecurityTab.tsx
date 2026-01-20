import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import password from '@/routes/password';
import { useForm } from '@inertiajs/react';
import { PasswordInput } from './PasswordInput';

export default function SecurityTab() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();

        put(password.change.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: () => {
                reset('password', 'password_confirmation');
            },
        });
    }

    return (
        <Card className="flex h-full w-full flex-1 flex-col rounded-none shadow-sm">
            <CardHeader className="border-b bg-white px-6 py-4">
                <CardTitle className="text-2xl font-semibold">Security</CardTitle>
                <p className="text-sm text-muted-foreground">Update your password to protect your account.</p>
            </CardHeader>

            <form onSubmit={handleSave} className="contents">
                <CardContent>
                    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="grid gap-6">
                                <div>
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <PasswordInput
                                        id="current_password"
                                        placeholder="Current Password"
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        disabled={processing}
                                        error={errors.current_password}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="new_password">New Password</Label>
                                    <PasswordInput
                                        id="new_password"
                                        placeholder="New Password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        error={errors.password}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="confirm_password">Confirm Password</Label>
                                    <PasswordInput
                                        id="confirm_password"
                                        placeholder="Connfirm Password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        error={errors.password_confirmation}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>{' '}
                <div className="flex justify-center border-t bg-white px-6 py-4 md:justify-end">
                    <Button type="submit" disabled={processing} className="w-full md:w-auto">
                        {processing ? 'Updating...' : 'Update password'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
