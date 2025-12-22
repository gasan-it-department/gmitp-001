import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MunicipalityData {
    code: string;
    name: string;
}

interface Props {
    value: string;
    onValueChange: (value: string) => void;
}

export function MunicipalityDropdown({ value, onValueChange }: Props) {
    const provinceCode = '174000000';
    const baseApi = 'https://psgc.gitlab.io/api';
    const [list, setList] = useState<MunicipalityData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMunicipalities = async () => {
            const response = await fetch(`${baseApi}/provinces/${provinceCode}/municipalities/`);

            const data = await response.json();

            const sortedData = data.sort((a: MunicipalityData, b: MunicipalityData) => a.name.localeCompare(b.name));

            setList(sortedData);
            setLoading(false);
        };
        fetchMunicipalities();
    }, []);

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-10 border-gray-300 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <SelectValue placeholder="All Municipalities" />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>

                {list.map((mun) => (
                    <SelectItem key={mun.code} value={mun.name}>
                        {mun.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
