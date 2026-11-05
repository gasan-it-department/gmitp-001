import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emptyAddressParts, FacilityAddressOption, FacilityAddressParts, formatAddressParts } from '@/Core/Types/Facility/FacilityTypes';

const NONE = '__none__';

function AddressSelect({
    id,
    label,
    value,
    options,
    disabled,
    placeholder,
    error,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    options: FacilityAddressOption[];
    disabled: boolean;
    placeholder: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Select value={value || NONE} onValueChange={(next) => onChange(next === NONE ? '' : next)} disabled={disabled}>
                <SelectTrigger id={id} className="h-10 w-full" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                    <SelectItem value={NONE}>{placeholder}</SelectItem>
                    {/* Preserve existing addresses even if a place has been renamed in the catalogue. */}
                    {value && !options.some((option) => option.name === value) && <SelectItem value={value}>{value}</SelectItem>}
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.name}>
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p id={`${id}-error`} className="text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function FacilityAddressFields({
    savedAddress,
    parts,
    barangays,
    disabled,
    errors,
    onChange,
    onClear,
}: {
    savedAddress: string;
    parts: FacilityAddressParts | null;
    barangays: FacilityAddressOption[];
    disabled: boolean;
    errors: Partial<Record<string, string>>;
    onChange: (parts: FacilityAddressParts | null) => void;
    onClear: () => void;
}) {
    const draft = parts ?? emptyAddressParts();

    return (
        <div className="space-y-4 border-t pt-5">
            <div>
                <h3 className="font-medium">Facility address</h3>
                <p className="mt-1 text-sm text-slate-500">Where visitors can find this facility.</p>
            </div>
            <p className="text-sm whitespace-pre-line text-slate-700">{savedAddress || 'No address added.'}</p>
            {parts === null ? (
                !disabled && (
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => onChange(emptyAddressParts())}>
                            {savedAddress ? 'Change address' : 'Add address'}
                        </Button>
                        {savedAddress && (
                            <Button type="button" variant="ghost" onClick={onClear}>
                                Clear address
                            </Button>
                        )}
                    </div>
                )
            ) : (
                <>
                    <div className="max-w-md">
                        <AddressSelect
                            id="facility-address-barangay"
                            label="Barangay"
                            value={draft.barangay}
                            options={barangays}
                            disabled={disabled || !barangays.length}
                            placeholder="Select barangay"
                            error={errors['address_parts.barangay']}
                            onChange={(barangay) => onChange({ ...draft, barangay })}
                        />
                    </div>
                    {!barangays.length && (
                        <p role="status" className="text-sm text-slate-500">
                            Barangay choices are unavailable. You can still enter street details or directions below.
                        </p>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="facility-address-line">Street details or directions</Label>
                        <Input
                            id="facility-address-line"
                            name="address_parts.street"
                            value={draft.street}
                            disabled={disabled}
                            maxLength={2000}
                            placeholder="Street, building, entrance or directions"
                            onChange={(event) => onChange({ ...draft, street: event.target.value })}
                            aria-invalid={Boolean(errors['address_parts.street'])}
                            aria-describedby={errors['address_parts.street'] ? 'facility-address-line-error' : undefined}
                        />
                        {errors['address_parts.street'] && (
                            <p id="facility-address-line-error" className="text-sm text-red-700">
                                {errors['address_parts.street']}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2 rounded-md bg-slate-50 p-3 text-sm">
                        <p className="font-medium">New address</p>
                        <p className="whitespace-pre-line text-slate-600">
                            {formatAddressParts(draft) || 'Enter street details or select a location above.'}
                        </p>
                        <p className="text-xs text-slate-500">Save facility details to apply this address.</p>
                    </div>
                    {!disabled && (
                        <Button type="button" variant="outline" onClick={() => onChange(null)}>
                            Cancel address change
                        </Button>
                    )}
                </>
            )}
            {errors.address && (
                <p role="alert" className="text-sm text-red-700">
                    {errors.address}
                </p>
            )}
            {errors.address_parts && (
                <p role="alert" className="text-sm text-red-700">
                    {errors.address_parts}
                </p>
            )}
        </div>
    );
}
