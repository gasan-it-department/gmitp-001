import BeginGoodsRegistrationController from '@/actions/App/External/Api/Controllers/GoodsDistribution/BeginGoodsRegistrationController';
import CheckGoodsRecipientController from '@/actions/App/External/Api/Controllers/GoodsDistribution/CheckGoodsRecipientController';
import SearchRegistrationHouseholdsController from '@/actions/App/External/Api/Controllers/GoodsDistribution/SearchRegistrationHouseholdsController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import ShowHouseholdProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowHouseholdProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { RegistrationIdentityCheck } from '@/pages/ActionCenter/Admin/Walkin/Components/RegistrationIdentityCheck';
import goodsDistributionRoutes from '@/routes/goodsDistribution';
import { Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowRight, ExternalLink, Loader2, Package, Search, UserPlus, Users } from 'lucide-react';
import { useRef, useState } from 'react';
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
}

export default function Recipients({ recipient, canManage, canCorrect, canIntakeDistribution }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const selected = recipient && ('data' in recipient ? recipient.data : recipient);
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        birth_date: '',
        identity_check_context: '',
        different_person_reason: '',
        household_id: '',
    });
    const [mode, setMode] = useState<'existing' | 'head'>('existing');
    const [search, setSearch] = useState('');
    const [households, setHouseholds] = useState<Household[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const searchVersion = useRef(0);
    const checked = Boolean(data.identity_check_context);
    const identity = {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix,
        birth_date: data.birth_date,
    };

    const searchHouseholds = async () => {
        const version = ++searchVersion.current;
        setSearching(true);
        setSearchError(null);
        setData('household_id', '');
        try {
            const response = await axios.post<{ data: Household[] }>(
                SearchRegistrationHouseholdsController.url(),
                { search },
                {
                    headers: { 'X-Municipality-Slug': slug },
                },
            );
            if (version === searchVersion.current) {
                setHouseholds(response.data.data);
                setSearched(true);
            }
        } catch {
            if (version === searchVersion.current) setSearchError('Could not search households. Try again.');
        } finally {
            if (version === searchVersion.current) setSearching(false);
        }
    };

    return (
        <DirectoryLayout title="Recipient registration" rootHref={goodsDistributionRoutes.recipients.url({ municipality: slug })}>
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
                            <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] sm:table-header-group">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Member</th>
                                    <th className="px-5 py-3 font-medium">Relationship to head</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selected.roster.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="grid grid-cols-2 border-b border-[#e8ede9] last:border-0 hover:bg-[#fafcfb] sm:table-row"
                                    >
                                        <td className="min-w-0 px-5 py-4 font-medium [overflow-wrap:anywhere]">
                                            <span className="mb-1 block text-xs font-normal text-[#75827c] sm:hidden">Member</span>
                                            {member.full_name}
                                        </td>
                                        <td className="min-w-0 px-5 py-4 [overflow-wrap:anywhere] capitalize">
                                            <span className="mb-1 block text-xs text-[#75827c] sm:hidden">Relationship to head</span>
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
                    setData((current) => ({ ...current, [field]: value, identity_check_context: '', different_person_reason: '' }));
                }}
                onContinue={(context, reason) =>
                    setData((current) => ({ ...current, identity_check_context: context, different_person_reason: reason ?? '' }))
                }
                checkUrl={CheckGoodsRecipientController.url()}
                municipalitySlug={slug}
                canCorrect={canCorrect}
                canRegister={canManage}
                goodsDistribution
                appearance="directory"
                submitError={errors.identity_check_context ?? (errors as Record<string, string>).registration_check}
            />

            {checked && canManage && (
                <section aria-label="Registration household" className="space-y-4 border-t border-[#dfe6e1] pt-6">
                    <h2 className="text-lg font-semibold [overflow-wrap:anywhere]">
                        Register {data.first_name} {data.last_name}
                    </h2>
                    <fieldset className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
                        <legend className="mb-2 font-medium">Household</legend>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="household-mode" checked={mode === 'existing'} onChange={() => setMode('existing')} /> Existing
                            household
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="household-mode"
                                checked={mode === 'head'}
                                onChange={() => {
                                    setMode('head');
                                    setData('household_id', '');
                                }}
                            />{' '}
                            This person heads a new household
                        </label>
                    </fieldset>
                    {mode === 'existing' && (
                        <div className="space-y-3">
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void searchHouseholds();
                                }}
                                className="flex flex-wrap items-end gap-2"
                            >
                                <div className="w-full min-w-0 space-y-1 sm:w-auto sm:flex-1">
                                    <Label htmlFor="household-search">Household code, head name, or barangay</Label>
                                    <Input
                                        id="household-search"
                                        className="border-[#dfe6e1] bg-white shadow-none"
                                        value={search}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setData('household_id', '');
                                            setHouseholds([]);
                                            setSearched(false);
                                            searchVersion.current++;
                                            setSearching(false);
                                        }}
                                    />
                                </div>
                                <Button type="submit" variant="outline" disabled={searching}>
                                    {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search
                                </Button>
                            </form>
                            {searchError && (
                                <p role="alert" className="text-sm text-red-700">
                                    {searchError}
                                </p>
                            )}
                            <ul className="divide-y divide-[#e8ede9]">
                                {households.map((household) => (
                                    <li key={household.id} className="py-3">
                                        <label className="flex items-start gap-3 text-sm">
                                            <input
                                                type="radio"
                                                name="destination-household"
                                                className="mt-1"
                                                checked={data.household_id === household.id}
                                                onChange={() => setData('household_id', household.id)}
                                            />
                                            <span className="min-w-0 [overflow-wrap:anywhere]">
                                                <span className="font-medium">
                                                    {household.household_code} · {household.head_name}
                                                </span>
                                                <span className="block text-[#75827c]">
                                                    {[household.street, household.barangay].filter(Boolean).join(', ')}
                                                </span>
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                            {searched && households.length === 0 && <p className="text-sm text-gray-600">No household with a recorded head found.</p>}
                            <Link
                                href={goodsDistributionRoutes.head.create.url({ municipality: slug })}
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#245e4f] hover:underline"
                            >
                                <UserPlus className="h-4 w-4" /> Register the actual household head first
                            </Link>
                        </div>
                    )}
                    <Button
                        className="bg-[#245e4f] text-white shadow-none hover:bg-[#1c4c3f]"
                        disabled={processing || (mode === 'existing' && !data.household_id)}
                        onClick={() =>
                            post(BeginGoodsRegistrationController.url(), {
                                headers: { 'X-Municipality-Slug': slug },
                                onError: () => setData('identity_check_context', ''),
                            })
                        }
                    >
                        {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />} Continue to
                        registration
                    </Button>
                </section>
            )}
        </DirectoryLayout>
    );
}
