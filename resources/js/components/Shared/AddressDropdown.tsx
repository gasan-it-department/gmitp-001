import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback, useEffect, useState } from 'react';

type LocationItem = { code: string; name: string };

type AddressData = {
    provinceCode: string;
    municipalityCode: string;
    barangayCode: string;
    provinceName: string;
    municipalityName: string;
    barangayName: string;
};

interface AddressDropdownProps {
    onAddressChange: (address: AddressData | null) => void;
}

const PROVINCES: LocationItem[] = [{ code: '174000000', name: 'Marinduque' }];

export function AddressDropdown({ onAddressChange }: AddressDropdownProps) {
    const BASE = 'https://psgc.gitlab.io/api';

    const [provinces] = useState<LocationItem[]>(PROVINCES);
    const [municipalities, setMunicipalities] = useState<LocationItem[]>([]);
    const [barangays, setBarangays] = useState<LocationItem[]>([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedMunicipality, setSelectedMunicipality] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState('');

    const [selectedNames, setSelectedNames] = useState({
        provinceName: '',
        municipalityName: '',
        barangayName: '',
    });

    // --- Fetch municipalities when province changes ---
    useEffect(() => {
        setMunicipalities([]);
        setBarangays([]);
        setSelectedMunicipality('');
        setSelectedBarangay('');
        setSelectedNames((prev) => ({ ...prev, municipalityName: '', barangayName: '' }));

        if (selectedProvince) {
            fetch(`${BASE}/provinces/${selectedProvince}/municipalities/`)
                .then((res) => res.json())
                .then((data: LocationItem[]) => setMunicipalities(data))
                .catch((err) => {
                    console.error('Error fetching municipalities:', err);
                    setMunicipalities([]);
                });
        }
    }, [selectedProvince]);

    // --- Fetch barangays when municipality changes ---
    useEffect(() => {
        setBarangays([]);
        setSelectedBarangay('');
        setSelectedNames((prev) => ({ ...prev, barangayName: '' }));

        if (selectedMunicipality) {
            fetch(`${BASE}/municipalities/${selectedMunicipality}/barangays/`)
                .then((res) => res.json())
                .then((data: LocationItem[]) => setBarangays(data))
                .catch((err) => {
                    console.error('Error fetching barangays:', err);
                    setBarangays([]);
                });
        }
    }, [selectedMunicipality]);

    // --- Propagate changes to parent ---
    useEffect(() => {
        if (selectedProvince && selectedMunicipality && selectedBarangay) {
            onAddressChange({
                provinceCode: selectedProvince,
                municipalityCode: selectedMunicipality,
                barangayCode: selectedBarangay,
                provinceName: selectedNames.provinceName,
                municipalityName: selectedNames.municipalityName,
                barangayName: selectedNames.barangayName,
            });
        } else {
            onAddressChange(null);
        }
    }, [selectedProvince, selectedMunicipality, selectedBarangay, selectedNames, onAddressChange]);

    // --- Handle select changes ---
    const handleSelectChange = useCallback(
        (setter: React.Dispatch<React.SetStateAction<string>>, nameKey: keyof typeof selectedNames, options: LocationItem[], value: string) => {
            const name = options.find((o) => o.code === value)?.name || '';

            setter(value);
            setSelectedNames((prev) => ({ ...prev, [nameKey]: name }));
        },
        [],
    );

    return (
        <div className="">
            {/* Province */}
            <div className="space-y-2">
                <Label htmlFor="province" className="text-sm font-semibold text-gray-700">
                    Province
                </Label>

                <Select value={selectedProvince} onValueChange={(val) => handleSelectChange(setSelectedProvince, 'provinceName', provinces, val)}>
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-semibold text-gray-600">
                        {provinces.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Municipality */}
            <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm font-semibold text-gray-700">
                    Municipality
                </Label>
                <Select
                    value={selectedMunicipality}
                    onValueChange={(val) => handleSelectChange(setSelectedMunicipality, 'municipalityName', municipalities, val)}
                    disabled={!selectedProvince || municipalities.length === 0}
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue placeholder={!selectedProvince ? 'Select a Province first' : 'Select a Municipality'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-semibold text-gray-600">
                        {municipalities.map((m) => (
                            <SelectItem key={m.code} value={m.code}>
                                {m.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Barangay */}
            <div>
                <Label htmlFor="municipality" className="text-sm font-semibold text-gray-700">
                    Barangay
                </Label>
                <Select
                    value={selectedBarangay}
                    onValueChange={(val) => handleSelectChange(setSelectedBarangay, 'barangayName', barangays, val)}
                    disabled={!selectedMunicipality}
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue placeholder={!selectedMunicipality ? 'Select a Municipality first' : 'Select a Barangay'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-semibold text-gray-600">
                        {barangays.map((b) => (
                            <SelectItem key={b.code} value={b.code}>
                                {b.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
