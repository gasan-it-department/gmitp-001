import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DecedentIntermentStatusFilterValue,
    DecedentListFilters,
    IdentityStatusValue,
    RegistrationStatusValue,
    SelectOption,
    VitalRecordTypeValue,
} from '@/Core/Types/Cemetery/cemetery';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    className?: string;
    filters: DecedentListFilters;
    registrationStatusOptions: SelectOption<RegistrationStatusValue>[];
    identityStatusOptions: SelectOption<IdentityStatusValue>[];
    vitalRecordTypeOptions: SelectOption<VitalRecordTypeValue>[];
    intermentStatusOptions: SelectOption<DecedentIntermentStatusFilterValue>[];
    onApply: (filters: DecedentListFilters) => void;
    onClear: () => void;
}

export default function DecedentsTableHeader({
    className,
    filters,
    registrationStatusOptions,
    identityStatusOptions,
    vitalRecordTypeOptions,
    intermentStatusOptions,
    onApply,
    onClear,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deathYear, setDeathYear] = useState(filters.death_year?.toString() ?? '');

    useEffect(() => {
        setSearch(filters.search ?? '');
        setDeathYear(filters.death_year?.toString() ?? '');
    }, [filters]);

    const hasActiveFilters = Boolean(
        filters.search ||
            filters.registration_status ||
            filters.identity_status ||
            filters.vital_record_type ||
            filters.interment_status ||
            filters.death_year,
    );

    const applyPatch = (patch: Partial<DecedentListFilters>) => {
        onApply({ ...filters, ...patch });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        applyPatch({
            search: search.trim() || null,
            death_year: deathYear.trim() ? Number(deathYear) : null,
        });
    };

    return (
        <div className={cn('space-y-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4', className)}>
            <form onSubmit={submitSearch} className="grid gap-2 lg:grid-cols-[minmax(240px,1fr)_140px_auto]">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, registry no., or case ref..." />
                <Input
                    value={deathYear}
                    onChange={(event) => setDeathYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                    placeholder="Death year"
                />
                <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    Search
                </Button>
            </form>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(150px,1fr))_auto]">
                <FilterSelect
                    value={filters.registration_status}
                    placeholder="Registration"
                    options={registrationStatusOptions}
                    onChange={(value) => applyPatch({ registration_status: value as RegistrationStatusValue | null })}
                />
                <FilterSelect
                    value={filters.identity_status}
                    placeholder="Identity"
                    options={identityStatusOptions}
                    onChange={(value) => applyPatch({ identity_status: value as IdentityStatusValue | null })}
                />
                <FilterSelect
                    value={filters.vital_record_type}
                    placeholder="Record type"
                    options={vitalRecordTypeOptions}
                    onChange={(value) => applyPatch({ vital_record_type: value as VitalRecordTypeValue | null })}
                />
                <FilterSelect
                    value={filters.interment_status}
                    placeholder="Interment"
                    options={intermentStatusOptions}
                    onChange={(value) => applyPatch({ interment_status: value as DecedentIntermentStatusFilterValue | null })}
                />
                <Button type="button" variant="outline" onClick={onClear} disabled={!hasActiveFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}

interface FilterSelectProps<T extends string> {
    value: T | null;
    placeholder: string;
    options: SelectOption<T>[];
    onChange: (value: T | null) => void;
}

function FilterSelect<T extends string>({ value, placeholder, options, onChange }: FilterSelectProps<T>) {
    return (
        <Select value={value ?? 'all'} onValueChange={(nextValue) => onChange(nextValue === 'all' ? null : (nextValue as T))}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All {placeholder}</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
