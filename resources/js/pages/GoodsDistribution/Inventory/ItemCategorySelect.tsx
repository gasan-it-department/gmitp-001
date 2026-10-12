import { usePage } from '@inertiajs/react';
import { Field, inputClass } from './components';

export function useItemCategories() {
    const { itemCategories } = usePage<{ itemCategories: { value: string; label: string }[] }>().props;
    const options = itemCategories ?? [];
    return { options, label: (value?: string | null) => options.find((option) => option.value === value)?.label ?? value ?? '' };
}

export default function ItemCategorySelect({
    value,
    legacyValue,
    onChange,
}: {
    value: string;
    legacyValue?: string | null;
    onChange: (value: string) => void;
}) {
    const { options } = useItemCategories();
    return (
        <Field label="Category">
            <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
                <option value="">No category</option>
                {legacyValue && !options.some((option) => option.value === legacyValue) && (
                    <option value={legacyValue}>{legacyValue} (existing category)</option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </Field>
    );
}
