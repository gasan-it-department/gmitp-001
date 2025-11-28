import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { AssistanceStatus } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const AssistanceStatusOptions = ({ onChange }: { onChange?: (value: string) => void }) => {
    const [options, setOptions] = useState<AssistanceStatus[]>([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await ActionCenterApi.getStatusLabels();
                if (response.success) setOptions(response.data);
                console.log(response);
            } catch (err: any) {
                console.error('Error fetching status options:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, []);

    const handleSelect = (value: string) => {
        setSelected(value);
        onChange?.(value);
    };
    return (
        <div className="space-y-2">
            <Label htmlFor="assistanceType" className="text-sm font-semibold text-gray-700">
                Type of Assistance
            </Label>

            <Select value={selected} onValueChange={handleSelect} disabled={loading}>
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
};
