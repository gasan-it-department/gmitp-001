import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { usePage } from '@inertiajs/react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

// Radix Select rejects empty-string item values — use a sentinel for "Any".
const ANY = '__any__';

interface Props {
    search: string;
    onSearch: (v: string) => void;
    birthDate: string;
    onBirthDate: (v: string) => void;
    barangay: string;
    onBarangay: (v: string) => void;
    sex: string;
    onSex: (v: string) => void;
    verification: string;
    onVerification: (v: string) => void;
    onClear: () => void;
    hasCriteria: boolean;
    loading?: boolean;
    collapseOnMobile?: boolean;
}

/**
 * Presentational filter bar for the beneficiary search.
 *
 * All debouncing and fetching live in the parent page. The only local state is
 * the optional mobile disclosure used by the registry page.
 */
export default function SearchFilters({
    search,
    onSearch,
    birthDate,
    onBirthDate,
    barangay,
    onBarangay,
    sex,
    onSex,
    verification,
    onVerification,
    onClear,
    hasCriteria,
    loading = false,
    collapseOnMobile = false,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const advancedFilterCount = [birthDate, barangay, sex, verification].filter(Boolean).length;

    const nameField = (className: string) => (
        <div className={className}>
            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Name</label>
            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="e.g. Dela Cruz, Juan" className="h-10 pl-9" autoFocus />
            </div>
        </div>
    );

    const advancedFields = (
        <>
            <div className="min-w-[150px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Birthdate</label>
                <Input type="date" value={birthDate} onChange={(e) => onBirthDate(e.target.value)} className="h-10" />
            </div>

            <div className="min-w-[200px]">
                <BarangaySelect
                    municipalityId={currentMunicipality.psgc_municipal_id}
                    value={barangay}
                    onChange={(selection) => onBarangay(selection.name)}
                    disabled={loading}
                    useNameAsValue={true}
                    includeAny={true}
                />
            </div>

            <div className="min-w-[140px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Sex</label>
                <Select value={sex || ANY} onValueChange={(value) => onSex(value === ANY ? '' : value)}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY}>Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="min-w-[160px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Verification</label>
                <Select value={verification || ANY} onValueChange={(value) => onVerification(value === ANY ? '' : value)}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY}>Any</SelectItem>
                        <SelectItem value="pending">Pending intake</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected intake</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasCriteria && (
                <Button
                    type="button"
                    variant="ghost"
                    className="h-10 self-end text-xs text-gray-600 hover:text-gray-900"
                    onClick={() => {
                        onClear();
                        setAdvancedFiltersOpen(false);
                    }}
                    disabled={loading}
                >
                    <X className="h-4 w-4" /> Clear
                </Button>
            )}
        </>
    );

    if (!collapseOnMobile) {
        return (
            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                {nameField('min-w-[240px] flex-1')}
                {advancedFields}
            </div>
        );
    }

    return (
        <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3 md:p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 md:block">
                {nameField('min-w-0')}
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 md:hidden"
                    aria-expanded={advancedFiltersOpen}
                    aria-controls="beneficiary-registry-advanced-filters"
                    onClick={() => setAdvancedFiltersOpen((open) => !open)}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden min-[360px]:inline">Filters</span>
                    {advancedFilterCount > 0 && <span className="text-xs">({advancedFilterCount})</span>}
                    <ChevronDown className={`h-4 w-4 transition-transform ${advancedFiltersOpen ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            <div
                id="beneficiary-registry-advanced-filters"
                className={`${advancedFiltersOpen ? 'grid' : 'hidden'} mt-3 grid-cols-1 items-end gap-3 md:grid md:grid-cols-2 xl:grid-cols-[minmax(150px,0.8fr)_minmax(200px,1fr)_minmax(140px,0.7fr)_minmax(160px,0.8fr)_auto]`}
            >
                {advancedFields}
            </div>
        </div>
    );
}
