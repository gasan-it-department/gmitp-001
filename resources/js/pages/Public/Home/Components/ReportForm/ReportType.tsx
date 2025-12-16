import { CommunityReportApi } from '@/Core/Api/CommunityReport/CommunityReportApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportType {
    value: string;
    label: string;
    color: string;
}

// 1. Add selectedValue to props
interface Props {
    onSelect?: (val: string) => void;
    selectedValue?: string;
}

export const ReportTypeOption = ({ onSelect, selectedValue }: Props) => {
    const { currentMunicipality } = useMunicipality();
    const [loading, setLoading] = useState(true);
    const [reportTypes, setReportTypes] = useState<ReportType[]>([]);

    useEffect(() => {
        const fetchTypes = async () => {
            if (!currentMunicipality) return;
            try {
                const response = await CommunityReportApi.getReportType(currentMunicipality.slug);
                // Handle response structure flexibility
                setReportTypes(Array.isArray(response) ? response : response.type || []);
            } catch (error) {
                console.error('Failed to fetch report types:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, [currentMunicipality]); // ✅ Fixed: Added dependency array to stop infinite loop

    if (loading)
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading options...
            </div>
        );

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {reportTypes.map((type) => {
                // 2. Check if this specific button is the selected one
                const isSelected = selectedValue === type.value;

                return (
                    <button
                        key={type.value}
                        onClick={() => onSelect?.(type.value)}
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition-all border-${type.color}-200 bg-${type.color}-50 text-${type.color}-700 ${/* Highlight Logic: If selected, add a thick ring or shadow */ ''} ${isSelected ? 'scale-105 font-bold shadow-md ring-2 ring-gray-400 ring-offset-2' : 'opacity-80 hover:scale-105 hover:opacity-100'} `}
                    >
                        <span className="text-sm">{type.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
