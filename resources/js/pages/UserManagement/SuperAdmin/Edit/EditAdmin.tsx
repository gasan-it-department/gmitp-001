import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Permission, User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { useForm } from '@inertiajs/react';
import { MunicipalitySelect } from '../UserRegistry/Components/MunicipalitySelect';
import { PermissionSelector } from '../UserRegistry/Components/Permission';

// UI Components
import UpdateAdminProfileController from '@/actions/App/External/Api/Controllers/UserManagement/UpdateAdminProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

interface Props {
    user: { data: User };
    data: {
        permissions: Permission[];
        municipality: MunicipalityType[];
    };
}

export default function EditAdmin({ user, data }: Props) {
    const userData = user.data;

    const {
        data: formData,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        first_name: userData.first_name ?? '',
        last_name: userData.last_name ?? '',
        middle_name: userData.middle_name ?? '',
        email: userData.email ?? '',
        phone: userData.phone ?? '',
        municipal_id: userData.municipality?.id ?? '',
        password: '',
        password_confirmation: '',
        permission: (userData.all_permission ?? []) as string[],
    });

    const handleToggle = (value: string) => {
        const current = formData.permission;
        const updated = current.includes(value) ? current.filter((id) => id !== value) : [...current, value];
        setData('permission', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(UpdateAdminProfileController.url(userData.id));
    };

    return (
        <BaseLayout>
            <form onSubmit={submit} className="relative min-h-screen bg-gray-50/50">
                {/* 1. STICKY HEADER: Title + Actions */}
                <div className="sticky top-0 z-10 border-b bg-white/80 px-8 py-4 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Edit Administrator</h1>
                                <p className="text-xs text-gray-500">
                                    Updating {userData.first_name} {userData.last_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="min-w-[140px]">
                                {processing ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Update Account
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. CENTERED CONTENT */}
                <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
                    {/* SECTION A: Identity & Jurisdiction */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                1
                            </span>
                            Account Details
                        </h4>
                        <p className="mb-6 text-sm text-gray-500">Basic information and assignment area.</p>
                        <div className="grid gap-6">
                            {/* Row 1: Names */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={formData.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="e.g. Juan"
                                    />
                                    {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={formData.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="e.g. Dela Cruz"
                                    />
                                    {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                                </div>
                            </div>

                            {/* Row 2: Middle Name & Municipality */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Middle Name (Optional)</Label>
                                    <Input
                                        value={formData.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        placeholder="e.g. Santos"
                                    />
                                    {errors.middle_name && <p className="text-xs text-red-500">{errors.middle_name}</p>}
                                </div>
                                <div>
                                    <MunicipalitySelect
                                        municipalities={data.municipality}
                                        selectedId={formData.municipal_id}
                                        errorMessage={errors.municipal_id}
                                        onChange={(val) => setData('municipal_id', val)}
                                    />
                                </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Row 3: Contact */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email (Required)</Label>
                                    <Input value={formData.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone (Required)</Label>
                                    <Input value={formData.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Row 4: Password (optional on edit) */}
                            <div>
                                <p className="mb-4 text-xs text-gray-500">
                                    Leave the password fields blank to keep the current password.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={formData.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            value={formData.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                        {errors.password && !formData.password_confirmation && (
                                            <p className="text-xs text-red-500">Please confirm the password.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION B: Permissions */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        <PermissionSelector allPermissions={data.permissions} selectedValues={formData.permission} onToggle={handleToggle} />
                        {errors.permission && <p className="mt-4 text-center text-sm text-red-500">{errors.permission}</p>}
                    </div>
                </div>
            </form>
        </BaseLayout>
    );
}
