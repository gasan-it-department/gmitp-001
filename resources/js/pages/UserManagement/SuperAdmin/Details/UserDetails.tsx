import { Button } from '@/components/ui/button';
import { User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { Head, router } from '@inertiajs/react'; // 1. Added router import
import { ArrowLeft, Building2, CheckCircle2, Hash, Mail, MapPin, Phone, Shield, User as UserIcon } from 'lucide-react';
import { UserDetailsActionMenu } from './Components/UserDetailsActionMenu';

interface Props {
    user: { data: User };
}

export default function UserDetails({ user }: Props) {
    const userData = user.data;

    // 2. Navigation logic: Preserves your filters and page number
    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback: If they opened the link in a new tab, go to the default list
            router.visit(route('superAdmin.users.index'));
        }
    };

    // 3. Defensive initials helper (Prevents "charAt of undefined" error)
    const getInitials = (first: string, last: string) => {
        const f = first?.charAt(0) || '';
        const l = last?.charAt(0) || '';
        return (f + l).toUpperCase() || 'NA';
    };

    const formatPermission = (perm: string) => {
        return perm.split('.').join(' ').replace('_', ' ');
    };

    return (
        <BaseLayout>
            <Head title={`${userData.first_name} ${userData.last_name}`} />

            <div className="mx-auto max-w-5xl p-6">
                {/* 4. Updated Back Button */}man
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    {' '}
                    <Button
                        variant="ghost"
                        onClick={handleBack} // Trigger the back logic
                        className="gap-2 pl-0 transition-colors hover:bg-transparent hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Back to users
                    </Button>
                    <UserDetailsActionMenu userId={userData.id} userName={userData.first_name} />
                </div>
                {/* 1. HEADER CARD */}
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col items-start sm:flex-row sm:items-end sm:gap-6">
                            <div className="-mt-12 mb-4 sm:mb-0">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-3xl font-bold text-white shadow-md">
                                    {getInitials(userData.first_name, userData.last_name)}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                                    {userData.first_name} {userData.middle_name} {userData.last_name}
                                </h1>
                                <div className="mt-1 flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <span className="font-medium text-gray-900">@{userData.user_name}</span>
                                    </span>

                                    {userData.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium tracking-wide text-blue-700 uppercase ring-1 ring-blue-700/10 ring-inset"
                                        >
                                            {role.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-0 sm:text-right">
                                <p className="text-xs font-medium text-gray-400 uppercase">System ID</p>
                                <p className="font-mono text-xs text-gray-600">{userData.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Personal Information */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                                <UserIcon className="h-4 w-4 text-orange-500" />
                                Personal Information
                            </h2>

                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs font-medium text-gray-500">Email Address</dt>
                                    <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                        {userData.email}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-gray-500">Phone Number</dt>
                                    <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                        {userData.phone || 'N/A'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Municipality Context */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                                <Building2 className="h-4 w-4 text-orange-500" />
                                Municipality Assignment
                            </h2>

                            {userData.municipality ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            {userData.municipality.name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Municipal Code</dt>
                                        <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                                            <Hash className="h-3.5 w-3.5 text-gray-400" />
                                            {userData.municipality.municipal_code}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Zip Code</dt>
                                        <dd className="mt-1 text-sm font-medium text-gray-900">{userData.municipality.zip_code}</dd>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 text-sm text-gray-500">
                                    No municipality assigned.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Permissions */}
                    <div className="lg:col-span-1">
                        <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                                <Shield className="h-4 w-4 text-orange-500" />
                                System Access
                            </h2>

                            <div className="mb-6">
                                <p className="mb-2 text-xs font-medium text-gray-500">Total Permissions</p>
                                <p className="text-2xl font-bold text-gray-900">{userData.all_permission.length}</p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-medium text-gray-500">Capabilities</p>
                                {userData.all_permission.length > 0 ? (
                                    <ul className="space-y-2">
                                        {userData.all_permission.map((perm, index) => (
                                            <li key={index} className="flex items-start gap-2.5">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                <span className="text-sm text-gray-700 capitalize">{formatPermission(perm)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No explicit permissions granted.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}
