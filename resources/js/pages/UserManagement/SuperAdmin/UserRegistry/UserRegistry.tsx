import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Permission } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { useForm } from '@inertiajs/react';
import { PermissionSelector } from './Components/Permission';

// UI Components
import CreateAdminController from '@/actions/App/External/Api/Controllers/Auth/CreateAdminController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { MunicipalitySelect } from './Components/MunicipalitySelect';

interface Props {
    data: {
        permissions: Permission[];
        municipality: MunicipalityType[];
    };
}

export default function UserRegistry({ data }: Props) {
    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        first_name: '',
        last_name: '',
        middle_name: '',
        user_name: '',
        email: '',
        phone: '',
        municipal_id: '',
        password: '',
        password_confirmation: '',
        permission: [] as string[],
    });

    const handleToggle = (value: string) => {
        const current = formData.permission;
        const updated = current.includes(value) ? current.filter((id) => id !== value) : [...current, value];
        setData('permission', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(CreateAdminController.store.url());
    };

    return (
        <BaseLayout>
            <form onSubmit={submit} className="relative min-h-screen bg-gray-50/50">
                {/* 1. STICKY HEADER: Title + Actions */}
                <div className="sticky top-0 z-10 border-b bg-white/80 px-8 py-4 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Create Administrator</h1>
                                <p className="text-xs text-gray-500">New Account Entry</p>
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
                                        <Save className="mr-2 h-4 w-4" /> Save Account
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

                            {/* Row 2: user_name & Municipality */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input value={formData.user_name} onChange={(e) => setData('user_name', e.target.value)} />
                                    {errors.user_name && <p className="text-xs text-red-500">{errors.user_name}</p>}
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

                            {/* Row 3: Contact (Optional) */}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    {/* Laravel's 'confirmed' rule will send errors here if they don't match */}
                                    {errors.password && !formData.password_confirmation && (
                                        <p className="text-xs text-red-500">Please confirm the password.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION B: Permissions */}
                    <div className="rounded-xl border bg-white p-8 shadow-sm">
                        {/* We reuse your component here, but it sits naturally in the flow now */}
                        <PermissionSelector allPermissions={data.permissions} selectedValues={formData.permission} onToggle={handleToggle} />
                        {errors.permission && <p className="mt-4 text-center text-sm text-red-500">{errors.permission}</p>}
                    </div>
                </div>
            </form>
        </BaseLayout>
    );
}
