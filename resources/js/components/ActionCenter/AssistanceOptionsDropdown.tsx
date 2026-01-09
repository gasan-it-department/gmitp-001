import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AssistanceOption } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function AssistanceOptions({ value, onChange, error }: Props) {
    const [options, setOptions] = useState<AssistanceOption[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentMunicipality } = useMunicipality();
    useEffect(() => {
        async function fetchOptions() {
            try {
                const res = await ActionCenterApi.getAssistanceTypes(currentMunicipality.slug);
                if (res.success) setOptions(res.data);

                console.log(res.data);
            } catch (err) {
                console.error('Error fetching assistance options:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchOptions();
    }, []);

    return (
        <div className="space-y-2">
            <Label htmlFor="assistanceType" className="text-sm font-semibold text-gray-700">
                Type of Assistance
            </Label>

            <Select value={value} onValueChange={onChange} disabled={loading}>
                <SelectTrigger className="w-full font-medium text-gray-600">
                    <SelectValue placeholder={loading ? 'Loading...' : 'Select Assistance Type'} />
                </SelectTrigger>

                <SelectContent className="max-h-60 font-semibold text-gray-600">
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
