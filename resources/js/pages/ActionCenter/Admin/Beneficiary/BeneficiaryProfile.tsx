import CreateAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/CreateAssistanceRequestController';
import DownloadBeneficiaryIntakeSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/DownloadBeneficiaryIntakeSheetController';
import EditBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/EditBeneficiaryProfileController';
import ShowBeneficiarySearchController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiarySearchController';
import { CrossMunicipalityWarning, type CrossMunicipalityMatch } from '@/components/Shared/CrossMunicipalityWarning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import Utility from '@/pages/Utility/Utility';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Download, HandCoins, Home, Link2, Mail, MapPin, Pencil, User, Users } from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, ReligionOption } from '../../Client/Apply/Beneficiary/types';
import AssistanceHistoryList, { type AssistanceHistoryRow } from './Components/AssistanceHistoryList';
import AvatarUploader from './Components/AvatarUploader';
import HouseholdMembersManager from './Components/HouseholdMembersManager';
import { type HouseholdMemberRow } from './Components/HouseholdMembersTable';
import LinkAccountDialog from './Components/LinkAccountDialog';
import { type RelationshipOption } from './Components/MemberFormDialog';

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror BeneficiaryProfileResource + the controller props
// ─────────────────────────────────────────────────────────────────────────────

interface BeneficiaryProfileData {
    id: string;
    beneficiary_number: string | null;
    avatar_url: string | null;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    sex_label: string | null;
    birth_date: string | null;
    age: number | null;
    educational_attainment: string | null;
    religion: string | null;
    civil_status: string | null;
    civil_status_label: string | null;
    occupation: string | null;
    monthly_income: number | null;
    household: { id: string; household_code: string | null; barangay: string | null; street: string | null } | null;
    has_account: boolean;
    account_email: string | null;
    terms_consented_at: string | null;
    registered_at: string | null;
}

interface Summary {
    total_requests: number;
    released_count: number;
    total_released_amount: number;
    active_member_count: number;
}

interface Props {
    beneficiary: { data: BeneficiaryProfileData } | BeneficiaryProfileData;
    householdMembers: { data: HouseholdMemberRow[] };
    assistanceHistory: { data: AssistanceHistoryRow[] };
    householdTotalIncome: number;
    crossMunicipalityMatches: { data: CrossMunicipalityMatch[] };
    summary: Summary;
    religions: ReligionOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    relationships: RelationshipOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BeneficiaryProfile({
    beneficiary,
    householdMembers,
    assistanceHistory,
    householdTotalIncome,
    crossMunicipalityMatches,
    summary,
    religions,
    civilStatus,
    educationalAttainment,
    relationships,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const utils = Utility();

    const profile: BeneficiaryProfileData = 'data' in beneficiary ? beneficiary.data : beneficiary;
    const members = householdMembers.data;
    const history = assistanceHistory.data;
    const crossMatches = crossMunicipalityMatches?.data ?? [];

    const [linkOpen, setLinkOpen] = useState(false);

    const address = [profile.household?.street, profile.household?.barangay].filter(Boolean).join(', ') || '—';

    return (
        <AdminLayout>
            <div className="bg-slate-50 pb-12">
                {/* Back navigation */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
                        <Link
                            href={ShowBeneficiarySearchController.url({ municipality: currentMunicipality.slug })}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Beneficiary Search
                        </Link>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Secondary action: correct a mistake on this record (admin-only) */}
                            <Link
                                href={EditBeneficiaryProfileController.url({
                                    municipality: currentMunicipality.slug,
                                    beneficiaryId: profile.id,
                                })}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit profile
                            </Link>

                            {/* Primary action: file an assistance request for this person */}
                            <Link
                                href={CreateAssistanceRequestController.url({
                                    municipality: currentMunicipality.slug,
                                    beneficiaryId: profile.id,
                                })}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                            >
                                <HandCoins className="h-4 w-4" />
                                File assistance request
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Header strip */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-6 py-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <AvatarUploader
                                    beneficiaryId={profile.id}
                                    avatarUrl={profile.avatar_url}
                                    fullName={profile.full_name}
                                    sizeClass="h-16 w-16"
                                />
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">{profile.full_name}</h1>
                                        {profile.beneficiary_number && (
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-slate-600">
                                                {profile.beneficiary_number}
                                            </span>
                                        )}
                                        {profile.has_account ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                <BadgeCheck className="h-3.5 w-3.5" /> Has account
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                Walk-in
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {[profile.sex_label, profile.age !== null ? `${profile.age} yrs` : null, profile.civil_status_label]
                                            .filter(Boolean)
                                            .join(' • ') || '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Summary stats */}
                            <div className="flex flex-wrap gap-3">
                                <Stat label="Total Requests" value={String(summary.total_requests)} />
                                <Stat label="Released" value={String(summary.released_count)} />
                                <Stat label="Total Received" value={utils.formatCurrency(summary.total_released_amount)} highlight />
                                <Stat label="Household Size" value={String(summary.active_member_count)} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Cross-municipality double-dip advisory */}
                {crossMatches.length > 0 && (
                    <div className="container mx-auto max-w-7xl px-6 pt-6">
                        <CrossMunicipalityWarning matches={crossMatches} context="profile" />
                    </div>
                )}

                {/* Main grid */}
                <div className="container mx-auto max-w-7xl px-6 py-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left column */}
                        <div className="space-y-6 lg:col-span-8">
                            {/* Identity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4 text-slate-600" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Field label="Full name" value={profile.full_name || '—'} capitalize />
                                        <Field label="Sex" value={profile.sex_label ?? '—'} />
                                        <Field
                                            label="Date of birth"
                                            value={utils.formatToReadableDateNoTime(profile.birth_date ?? undefined)}
                                            sub={profile.age !== null ? `Age ${profile.age}` : undefined}
                                        />
                                        <Field label="Civil status" value={profile.civil_status_label ?? '—'} />
                                        <Field label="Educational attainment" value={profile.educational_attainment ?? '—'} capitalize />
                                        <Field label="Religion" value={profile.religion ?? '—'} capitalize />
                                        <Field label="Occupation" value={profile.occupation ?? '—'} capitalize />
                                        <Field
                                            label="Personal monthly income"
                                            value={profile.monthly_income !== null ? utils.formatCurrency(profile.monthly_income) : '—'}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Household */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Users className="h-4 w-4 text-slate-600" /> Household Composition
                                    </CardTitle>
                                    <span className="text-xs text-slate-400">{summary.active_member_count} active members</span>
                                </CardHeader>
                                <CardContent>
                                    <HouseholdMembersManager
                                        members={members}
                                        totalIncome={householdTotalIncome}
                                        beneficiaryId={profile.id}
                                        religions={religions}
                                        civilStatus={civilStatus}
                                        educationalAttainment={educationalAttainment}
                                        relationships={relationships}
                                    />
                                </CardContent>
                            </Card>

                            {/* Assistance history */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <HandCoins className="h-4 w-4 text-slate-600" /> Assistance History (all programs)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AssistanceHistoryList history={history} municipalitySlug={currentMunicipality.slug} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right column */}
                        <div className="space-y-6 lg:col-span-4">
                            {/* Contact / address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Home className="h-4 w-4 text-slate-600" /> Address & Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Address</p>
                                            <p className="text-sm text-slate-800 capitalize">{address}</p>
                                            {profile.household?.household_code && (
                                                <p className="mt-0.5 text-[11px] text-slate-400">HH #{profile.household.household_code}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Account</p>
                                            <p className="text-sm text-slate-800">{profile.account_email ?? 'Walk-in (no portal account)'}</p>
                                            <button
                                                type="button"
                                                onClick={() => setLinkOpen(true)}
                                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                            >
                                                <Link2 className="h-3.5 w-3.5" />
                                                {profile.has_account ? 'Change linked account' : 'Link a portal account'}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Intake sheet */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={DownloadBeneficiaryIntakeSheetController.url({
                                            municipality: currentMunicipality.slug,
                                            beneficiaryId: profile.id,
                                        })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Intake Sheet (PDF)
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <LinkAccountDialog
                beneficiaryId={profile.id}
                beneficiaryName={profile.full_name}
                currentEmail={profile.account_email}
                isOpen={linkOpen}
                onClose={() => setLinkOpen(false)}
            />
        </AdminLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bits
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, value, sub, capitalize = false }: { label: string; value: string; sub?: string; capitalize?: boolean }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
        </div>
    );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`rounded-xl border px-4 py-2 text-right ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <p className={`text-[10px] font-bold tracking-widest uppercase ${highlight ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</p>
            <p className={`mt-0.5 text-lg font-bold ${highlight ? 'text-emerald-900' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}
