import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Permission } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { Link, useForm } from '@inertiajs/react';
import { MunicipalitySelect } from './Components/MunicipalitySelect';
import { PermissionSelector } from './Components/Permission';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';

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
        firstName: '',
        lastName: '',
        middleName: '',
        userName: '',
        email: '',
        phone: '',
        municipality_id: '',
        permission: [] as string[],
    });

    const handleToggle = (value: string) => {
        const current = formData.permission;
        const updated = current.includes(value) ? current.filter((id) => id !== value) : [...current, value];
        setData('permission', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <BaseLayout>
            <form onSubmit={submit} className="relative min-h-screen bg-gray-50/50">
                {/* 1. STICKY HEADER: Title + Actions */}
                <div className="sticky top-0 z-10 border-b bg-white/80 px-8 py-4 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/users" className="rounded-full p-2 hover:bg-gray-100">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
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
                                        value={formData.firstName}
                                        onChange={(e) => setData('firstName', e.target.value)}
                                        placeholder="e.g. Juan"
                                    />
                                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setData('lastName', e.target.value)}
                                        placeholder="e.g. Dela Cruz"
                                    />
                                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                                </div>
                            </div>

                            {/* Row 2: Username & Municipality */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input value={formData.userName} onChange={(e) => setData('userName', e.target.value)} />
                                    {errors.userName && <p className="text-xs text-red-500">{errors.userName}</p>}
                                </div>

                                <MunicipalitySelect
                                    municipalities={data.municipality}
                                    selectedId={formData.municipality_id}
                                    errorMessage={errors.municipality_id}
                                    onChange={(val) => setData('municipality_id', val)}
                                />
                            </div>

                            <Separator className="my-2" />

                            {/* Row 3: Contact (Optional) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email (Optional)</Label>
                                    <Input value={formData.email} onChange={(e) => setData('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone (Optional)</Label>
                                    <Input value={formData.phone} onChange={(e) => setData('phone', e.target.value)} />
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
