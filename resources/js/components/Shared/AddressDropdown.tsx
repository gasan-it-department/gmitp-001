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
    editProvince: string;
    editMunicipality: string;
    editBarangay: string;
    onAddressChange: (address: AddressData | null) => void;
}

const PROVINCES: LocationItem[] = [{ code: '174000000', name: 'Marinduque' }];

export function AddressDropdown({
    onAddressChange,
    editProvince,
    editMunicipality,
    editBarangay,
}: AddressDropdownProps) {
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

    useEffect(() => {
        if(editProvince === ""){
            return;
        }
        const loadNames = async () => {
            try {
                let provinceName = '';
                let municipalityName = '';
                let barangayName = '';

                // 🏛️ Province
                if (editProvince) {
                    const res = await fetch(`${BASE}/provinces/${editProvince}/`);
                    if (!res.ok) throw new Error('Failed to fetch province');
                    const data = await res.json();
                    provinceName = data.name;
                    console.log("Province name:", provinceName);
                }

                // 🏙️ Municipality
                if (editMunicipality) {
                    const res = await fetch(`${BASE}/municipalities/${editMunicipality}/`);
                    if (!res.ok) throw new Error('Failed to fetch municipality');
                    const data = await res.json();
                    municipalityName = data.name;
                    console.log("Municipality name:", municipalityName);
                }

                // 🏘️ Barangay
                if (editBarangay) {
                    const res = await fetch(`${BASE}/barangays/${editBarangay}/`);
                    if (!res.ok) throw new Error('Failed to fetch barangay');
                    const data = await res.json();
                    barangayName = data.name;
                    console.log("Barangay name:", barangayName);
                }

                // ✅ Update names state
                setSelectedNames({
                    provinceName,
                    municipalityName,
                    barangayName,
                });
            } catch (err) {
                console.error("❌ Error loading address names:", err);
            }
        };

        loadNames();
    }, [editProvince, editMunicipality, editBarangay]);

    // --- Handle user selection changes ---
    const handleSelectChange = useCallback(
        async (
            setter: React.Dispatch<React.SetStateAction<string>>,
            nameKey: keyof typeof selectedNames,
            options: LocationItem[],
            value: string,
        ) => {
            const name = options.find((o) => o.code === value)?.name || '';
            setter(value);
            setSelectedNames((prev) => ({ ...prev, [nameKey]: name }));

            // Handle dependent fetches
            if (nameKey === 'provinceName') {
                setSelectedMunicipality('');
                setSelectedBarangay('');
                setBarangays([]);
                const res = await fetch(`${BASE}/provinces/${value}/municipalities/`);
                const data: LocationItem[] = await res.json();
                setMunicipalities(data);
            }

            if (nameKey === 'municipalityName') {
                setSelectedBarangay('');
                const res = await fetch(`${BASE}/municipalities/${value}/barangays/`);
                const data: LocationItem[] = await res.json();
                setBarangays(data);
            }
        },
        [],
    );

    // --- Propagate final selection to parent ---
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
        }
    }, [selectedProvince, selectedMunicipality, selectedBarangay, selectedNames, onAddressChange]);

    return (
        <div className="space-y-3">
            {/* Province */}
            <div className="space-y-2">
                <Label htmlFor="province" className="text-sm font-semibold text-gray-700">
                    Province
                </Label>
                <Select
                    value={selectedProvince}
                    onValueChange={(val) =>
                        handleSelectChange(setSelectedProvince, 'provinceName', provinces, val)
                    }
                    disabled={false} // Province is always enabled
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue
                            placeholder={selectedNames.provinceName || 'Select a Province'}
                        />
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
                    onValueChange={(val) =>
                        handleSelectChange(setSelectedMunicipality, 'municipalityName', municipalities, val)
                    }
                    disabled={
                        // Disable when adding and no province selected
                        (!editProvince && editMunicipality === "" && editBarangay === "" && selectedProvince === "") ||
                        municipalities.length === 0
                    }
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue
                            placeholder={
                                selectedNames.municipalityName ||
                                (!selectedProvince ? 'Select a Province first' : 'Select a Municipality')
                            }
                        />
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
            <div className="space-y-2">
                <Label htmlFor="barangay" className="text-sm font-semibold text-gray-700">
                    Barangay
                </Label>
                <Select
                    value={selectedBarangay}
                    onValueChange={(val) =>
                        handleSelectChange(setSelectedBarangay, 'barangayName', barangays, val)
                    }
                    disabled={
                        // Disable when adding and no municipality selected
                        (editProvince !== "" && editMunicipality !== "" && editBarangay !== "" && selectedMunicipality !== "") ||
                        barangays.length === 0
                    }
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue
                            placeholder={
                                selectedNames.barangayName ||
                                (!selectedMunicipality ? 'Select a Municipality first' : 'Select a Barangay')
                            }
                        />
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
