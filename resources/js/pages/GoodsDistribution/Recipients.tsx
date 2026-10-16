import BeginGoodsRegistrationController from '@/actions/App/External/Api/Controllers/GoodsDistribution/BeginGoodsRegistrationController';
import CheckGoodsRecipientController from '@/actions/App/External/Api/Controllers/GoodsDistribution/CheckGoodsRecipientController';
import ListBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ListBeneficiaryController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import ShowHouseholdProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowHouseholdProfileController';
import { Button } from '@/components/ui/button';
import type { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { RegistrationIdentityCheck } from '@/pages/ActionCenter/Admin/Walkin/Components/RegistrationIdentityCheck';
import goodsDistributionRoutes from '@/routes/goodsDistribution';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ExternalLink, Package, UserPlus, Users } from 'lucide-react';
import { DirectoryLayout, DirectoryPanel, DirectoryStatus } from './Inventory/DirectoryLayout';

interface Household {
    id: string;
    household_code: string | null;
    barangay: string | null;
    street: string | null;
    head_name: string | null;
}

interface Recipient {
    id: string;
    full_name: string;
    beneficiary_number: string | null;
    birth_date: string | null;
    is_active: boolean;
    identity_verified: boolean;
    active_member_id: string | null;
    relationship: string | null;
    household: Household;
    roster: Array<{ id: string; beneficiary_id: string | null; full_name: string; relationship: string | null }>;
}

interface Props {
    recipient: { data: Recipient } | Recipient | null;
    canManage: boolean;
    canCorrect: boolean;
    canIntakeDistribution?: boolean;
    canViewGoodsProfile?: boolean;
}

export default function Recipients({ recipient, canManage, canCorrect, canIntakeDistribution, canViewGoodsProfile = false }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const selected = recipient && ('data' in recipient ? recipient.data : recipient);
    const { data, setData, post, processing, errors, transform, clearErrors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        birth_date: '',
        identity_check_context: '',
        different_person_reason: '',
    });
    const identity = {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix,
        birth_date: data.birth_date,
    };

    const beginRegistration = (context: string, reason: string | null) => {
        if (processing || !canManage) return;
        transform((current) => ({ ...current, identity_check_context: context, different_person_reason: reason ?? '' }));
        post(BeginGoodsRegistrationController.url(), {
            headers: { 'X-Municipality-Slug': slug },
            onError: () => setData('identity_check_context', ''),
        });
    };

    return (
        <DirectoryLayout
            title="Recipient registration"
            rootHref={goodsDistributionRoutes.recipients.url({ municipality: slug })}
            actions={
                <Button variant="outline" asChild>
                    <Link href={ListBeneficiaryController.url({ municipality: slug })}>
                        <Users className="size-4" />
                        Beneficiary registry
                    </Link>
                </Button>
            }
        >
            {selected && (
                <section aria-label="Selected recipient" className="space-y-5 border-b border-[#dfe6e1] pb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                            <p className="text-xs font-medium text-[#75827c]">Selected recipient</p>
                            <h2 className="text-xl font-semibold [overflow-wrap:anywhere]">{selected.full_name}</h2>
                            <p className="text-sm text-[#75827c]">
                                {selected.beneficiary_number ?? 'No beneficiary number'} · {selected.birth_date ?? 'Birth date not recorded'}
                            </p>
                            <DirectoryStatus active={selected.is_active} />
                        </div>
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            {canViewGoodsProfile && (
                                <Button variant="outline" asChild>
                                    <Link href={goodsDistributionRoutes.recipient.show.url({ municipality: slug, beneficiaryId: selected.id })}>
                                        <Package className="size-4" />
                                        View Goods Profile
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline" className="border-[#dfe6e1] bg-white text-[#245e4f] shadow-none">
                                <Link href={ShowBeneficiaryProfileController.url({ municipality: slug, beneficiaryId: selected.id })}>
                                    <ExternalLink className="size-4" /> View beneficiary
                                </Link>
                            </Button>
                            {canIntakeDistribution && (
                                <Button asChild className="bg-[#245e4f] text-white shadow-none hover:bg-[#1c4c3f]">
                                    <Link
                                        href={`${goodsDistributionRoutes.requests.create.url({ municipality: slug })}?beneficiary_id=${selected.id}`}
                                    >
                                        <Package className="size-4" /> New distribution request
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                    <dl className="grid gap-4 border-y border-[#e8ede9] py-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="mb-1 text-xs text-[#75827c]">Identity</dt>
                            <dd className={selected.identity_verified ? 'text-[#44785c]' : 'text-amber-800'}>
                                {selected.identity_verified ? 'Verified' : 'Pending verification'}
                            </dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-xs text-[#75827c]">Household membership</dt>
                            <dd>{selected.active_member_id ? 'Active in this household' : 'Needs review'}</dd>
                        </div>
                    </dl>
                    {!selected.is_active && (
                        <p role="alert" className="text-sm text-amber-800">
                            This beneficiary is inactive or merged. Review the profile before proceeding.
                        </p>
                    )}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1 text-sm [overflow-wrap:anywhere]">
                            <h3 className="flex items-center gap-2 font-medium">
                                <Users className="size-4 shrink-0 text-[#607d6b]" />
                                {selected.household.household_code ?? 'Household'}
                            </h3>
                            <p className="text-[#75827c]">
                                {[selected.household.street, selected.household.barangay].filter(Boolean).join(', ') || 'Address not recorded'}
                            </p>
                            <p className="text-[#75827c]">
                                Household head: <span className="text-[#394c43]">{selected.household.head_name ?? 'Not assigned'}</span>
                            </p>
                        </div>
                        <Link
                            href={ShowHouseholdProfileController.url({ municipality: slug, householdId: selected.household.id })}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#245e4f] hover:underline"
                        >
                            <ExternalLink className="h-4 w-4" /> Manage household
                        </Link>
                    </div>
                    <DirectoryPanel label="Active household roster" countLabel={`${selected.roster.length} members`} toolbar={null}>
                        <table className="w-full table-fixed text-left text-sm">
                            <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] @min-[640px]/goods:table-header-group">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Member</th>
                                    <th className="px-5 py-3 font-medium">Relationship to head</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selected.roster.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="grid grid-cols-2 border-b border-[#e8ede9] last:border-0 hover:bg-[#fafcfb] @min-[640px]/goods:table-row"
                                    >
                                        <td className="min-w-0 px-5 py-4 font-medium [overflow-wrap:anywhere]">
                                            <span className="mb-1 block text-xs font-normal text-[#75827c] @min-[640px]/goods:hidden">Member</span>
                                            {member.full_name}
                                        </td>
                                        <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere] capitalize">
                                            <span className="mb-1 block text-xs text-[#75827c] @min-[640px]/goods:hidden">Relationship to head</span>
                                            {member.relationship?.replaceAll('_', ' ') ?? 'Not recorded'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {selected.roster.length === 0 && (
                            <p className="border-t border-[#e8ede9] px-5 py-8 text-center text-sm text-[#75827c]">No active household members.</p>
                        )}
                    </DirectoryPanel>
                    {canManage && selected.household.head_name && (
                        <Link
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#245e4f] hover:underline"
                            href={goodsDistributionRoutes.member.create.url({ municipality: slug, householdId: selected.household.id })}
                        >
                            <UserPlus className="h-4 w-4" /> Register another person in this household
                        </Link>
                    )}
                </section>
            )}

            <RegistrationIdentityCheck
                identity={identity}
                onChange={(field, value) => {
                    clearErrors();
                    setData((current) => ({ ...current, [field]: value, identity_check_context: '', different_person_reason: '' }));
                }}
                onContinue={beginRegistration}
                checkUrl={CheckGoodsRecipientController.url()}
                municipalitySlug={slug}
                canCorrect={canCorrect}
                canRegister={canManage}
                continuing={processing}
                goodsDistribution
                appearance="directory"
                submitError={errors.identity_check_context ?? (errors as Record<string, string>).registration_check ?? Object.values(errors)[0]}
            />
        </DirectoryLayout>
    );
}
