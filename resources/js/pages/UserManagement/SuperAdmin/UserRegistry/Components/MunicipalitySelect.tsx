import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';

interface Props {
    municipalities: MunicipalityType[];
    selectedId: string;
    errorMessage?: string;
    onChange: (value: string) => void;
}

export const MunicipalitySelect = ({ municipalities, selectedId, errorMessage, onChange }: Props) => {
    return (
        <>
            <Label>Select Municipality</Label>
            <Select onValueChange={(value) => onChange(value)} value={selectedId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a municipality..." />
                </SelectTrigger>
                <SelectContent>
                    {municipalities.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                            {m.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
        </>
    );
};
