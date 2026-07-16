import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';

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
}

/**
 * Presentational filter bar for the beneficiary search.
 *
 * Pure inputs — all debouncing and fetching live in the parent page so this
 * component can be reused or restyled without touching search behaviour.
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
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            {/* Name */}
            <div className="min-w-[240px] flex-1">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Name</label>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="e.g. Dela Cruz, Juan"
                        className="h-10 pl-9"
                        autoFocus
                    />
                </div>
            </div>

            {/* Birthdate */}
            <div className="min-w-[150px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Birthdate</label>
                <Input type="date" value={birthDate} onChange={(e) => onBirthDate(e.target.value)} className="h-10" />
            </div>

            {/* Barangay */}
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

            {/* Sex */}
            <div className="min-w-[140px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Sex</label>
                <Select value={sex || ANY} onValueChange={(v) => onSex(v === ANY ? '' : v)}>
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

            {/* Clear */}
            <div className="min-w-[160px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Verification</label>
                <Select value={verification || ANY} onValueChange={(v) => onVerification(v === ANY ? '' : v)}>
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

            {/* Clear */}
            {hasCriteria && (
                <Button type="button" variant="ghost" className="h-10 text-xs text-gray-600 hover:text-gray-900" onClick={onClear} disabled={loading}>
                    <X className="mr-1 h-4 w-4" /> Clear
                </Button>
            )}
        </div>
    );
}
