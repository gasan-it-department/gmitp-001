import StoreHouseholdMemberController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/StoreHouseholdMemberController';
import ListBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ListBeneficiaryController';
import ShowCreateHouseholdBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowCreateHouseholdBeneficiaryController';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import Utility from '@/pages/Utility/Utility';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Clock3, Home, MapPin, Plus, UserRound, Users } from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, ReligionOption } from '../../Client/Apply/Beneficiary/types';
import type { HouseholdHeadState } from '../Beneficiary/Profile/Components/ChangeHouseholdHeadDialog';
import HouseholdAssistanceHistoryList, { type HouseholdAssistanceHistoryRow } from '../Beneficiary/Profile/Components/HouseholdAssistanceHistoryList';
import HouseholdMembersManager from '../Beneficiary/Profile/Components/HouseholdMembersManager';
import type { HouseholdMemberRow } from '../Beneficiary/Profile/Components/HouseholdMembersTable';
import MemberFormDialog, { type RelationshipOption } from '../Beneficiary/Profile/Components/MemberFormDialog';
import AddPersonDialog from './Components/AddPersonDialog';
import TransferBeneficiaryIntoHouseholdDialog from './Components/TransferBeneficiaryIntoHouseholdDialog';

interface HouseholdData {
    id: string;
    household_code: string | null;
    barangay: string | null;
    barangay_psgc_code: string | null;
    street: string | null;
    is_verified: boolean;
    is_on_hold: boolean;
    head: {
        member_id: string;
        beneficiary_id: string | null;
        full_name: string;
        beneficiary_number: string | null;
        identity_verified: boolean;
    } | null;
    permissions: {
        manage: boolean;
        correct: boolean;
        verify: boolean;
        view_requests: boolean;
    };
}

interface Props {
    household: { data: HouseholdData } | HouseholdData;
    members: { data: HouseholdMemberRow[] };
    history: { data: HouseholdAssistanceHistoryRow[] };
    historySummary: { request_count: number; released_count: number; total_released_amount: number };
    summary: { active_member_count: number; moved_out_member_count: number; estimated_monthly_income: number };
    headState: HouseholdHeadState;
    religions: ReligionOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    relationships: RelationshipOption[];
    headDispositions: EnumOption[];
}

export default function HouseholdProfile({
    household,
    members,
    history,
    historySummary,
    summary,
    headState,
    religions,
    civilStatus,
    educationalAttainment,
    relationships,
    headDispositions,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const utils = Utility();
    const profile = 'data' in household ? household.data : household;
    const [choiceOpen, setChoiceOpen] = useState(false);
    const [memberOpen, setMemberOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const address = [profile.street, profile.barangay].filter(Boolean).join(', ') || 'Address unavailable';
    const storeMemberUrl = StoreHouseholdMemberController.url({ householdId: profile.id });

    const openUnregistered = () => {
        setChoiceOpen(false);
        setMemberOpen(true);
    };
    const openRegistration = () => {
        setChoiceOpen(false);
        router.visit(
            ShowCreateHouseholdBeneficiaryController.url({
                municipality: currentMunicipality.slug,
                householdId: profile.id,
            }),
        );
    };
    const openTransfer = () => {
        setChoiceOpen(false);
        setTransferOpen(true);
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-slate-50 pb-12">
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <Link
                                href={ListBeneficiaryController.url({ municipality: currentMunicipality.slug })}
                                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to beneficiaries
                            </Link>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <h1 className="font-mono text-xl font-bold text-slate-950 sm:text-2xl">{profile.household_code ?? 'Household'}</h1>
                                <HouseholdStatus verified={profile.is_verified} onHold={profile.is_on_hold} />
                            </div>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="h-4 w-4" /> {address}
                            </p>
                        </div>

                        {(profile.permissions.manage || profile.permissions.correct) && (
                            <button
                                type="button"
                                onClick={() => setChoiceOpen(true)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                <Plus className="h-4 w-4" /> Add person
                            </button>
                        )}
                    </div>
                </div>

                <main className="container mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Summary label="Household head" value={profile.head?.full_name ?? 'Not assigned'} icon={<UserRound className="h-4 w-4" />} />
                        <Summary label="Active members" value={String(summary.active_member_count)} icon={<Users className="h-4 w-4" />} />
                        <Summary label="Moved out" value={String(summary.moved_out_member_count)} icon={<Home className="h-4 w-4" />} />
                        <Summary
                            label="Estimated monthly income"
                            value={utils.formatCurrency(summary.estimated_monthly_income)}
                            icon={<BadgeCheck className="h-4 w-4" />}
                        />
                    </div>

                    <Card>
                        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4 text-slate-600" /> Household roster
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                            <HouseholdMembersManager
                                members={members.data}
                                totalIncome={summary.estimated_monthly_income}
                                storeMemberUrl={storeMemberUrl}
                                onAddPerson={() => setChoiceOpen(true)}
                                allowHeadManagement
                                religions={religions}
                                civilStatus={civilStatus}
                                educationalAttainment={educationalAttainment}
                                relationships={relationships}
                                householdId={profile.id}
                                headState={headState}
                                headDispositions={headDispositions}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2 sm:p-6 sm:pb-3">
                            <div>
                                <CardTitle className="text-base">Household assistance history</CardTitle>
                                <p className="mt-1 text-xs text-slate-500">Every request filed under this household record.</p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-slate-500">
                                {historySummary.request_count} {historySummary.request_count === 1 ? 'request' : 'requests'}
                            </span>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                            <HouseholdAssistanceHistoryList
                                history={history.data}
                                municipalitySlug={currentMunicipality.slug}
                                canOpenRequests={profile.permissions.view_requests}
                                emptyMessage="No assistance requests have been filed under this household."
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>

            <AddPersonDialog
                open={choiceOpen}
                onClose={() => setChoiceOpen(false)}
                canManage={profile.permissions.manage}
                canCorrect={profile.permissions.correct}
                onAddUnregistered={openUnregistered}
                onRegisterBeneficiary={openRegistration}
                onTransferBeneficiary={openTransfer}
            />
            {profile.permissions.manage && (
                <MemberFormDialog
                    open={memberOpen}
                    onClose={() => setMemberOpen(false)}
                    mode="add"
                    storeUrl={storeMemberUrl}
                    religions={religions}
                    civilStatus={civilStatus}
                    educationalAttainment={educationalAttainment}
                    relationships={relationships}
                />
            )}
            {profile.permissions.correct && (
                <TransferBeneficiaryIntoHouseholdDialog
                    open={transferOpen}
                    onClose={() => setTransferOpen(false)}
                    householdId={profile.id}
                    canVerify={profile.permissions.verify}
                    relationships={relationships}
                />
            )}
        </AdminLayout>
    );
}

function HouseholdStatus({ verified, onHold }: { verified: boolean; onHold: boolean }) {
    if (onHold) {
        return <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800 uppercase">On hold</span>;
    }
    if (verified) {
        return <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800 uppercase">Verified household</span>;
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
            <Clock3 className="h-3 w-3" /> Pending verification
        </span>
    );
}

function Summary({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="min-w-0 rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                {icon} {label}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900" title={value}>
                {value}
            </p>
        </div>
    );
}
