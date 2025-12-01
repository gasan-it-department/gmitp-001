import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

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
    editProvince?: string;
    editMunicipality?: string;
    editBarangay?: string;
    onAddressChange: (address: AddressData | null) => void;
}

const PROVINCES: LocationItem[] = [{ code: "174000000", name: "Marinduque" }];

export function AddressDropdown({
    onAddressChange,
    editProvince = "",
    editMunicipality = "",
    editBarangay = "",
}: AddressDropdownProps) {
    const BASE = "https://psgc.gitlab.io/api";

    const [provinces] = useState<LocationItem[]>(PROVINCES);
    const [municipalities, setMunicipalities] = useState<LocationItem[]>([]);
    const [barangays, setBarangays] = useState<LocationItem[]>([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");

    useEffect(() => {
        async function init() {
            if (!editProvince) return;
            setSelectedProvince(editProvince);

            const muniRes = await fetch(`${BASE}/provinces/${editProvince}/municipalities/`);
            const muniList: LocationItem[] = await muniRes.json();
            setMunicipalities(muniList);

            if (editMunicipality) {
                setSelectedMunicipality(editMunicipality);
                const brgyRes = await fetch(`${BASE}/municipalities/${editMunicipality}/barangays/`);
                const brgyList: LocationItem[] = await brgyRes.json();
                setBarangays(brgyList);
            }

            if (editBarangay) setSelectedBarangay(editBarangay);
        }
        init();
    }, [editProvince, editMunicipality, editBarangay]);

    // Cascading
    const handleProvinceChange = async (code: string) => {
        setSelectedProvince(code);
        setSelectedMunicipality("");
        setSelectedBarangay("");
        setBarangays([]);
        const res = await fetch(`${BASE}/provinces/${code}/municipalities/`);
        const data: LocationItem[] = await res.json();
        setMunicipalities(data);
    };

    const handleMunicipalityChange = async (code: string) => {
        setSelectedMunicipality(code);
        setSelectedBarangay("");
        const res = await fetch(`${BASE}/municipalities/${code}/barangays/`);
        const data: LocationItem[] = await res.json();
        setBarangays(data);
    };

    const handleBarangayChange = (code: string) => {
        setSelectedBarangay(code);
    };

    useEffect(() => {
        if (!selectedProvince || !selectedMunicipality || !selectedBarangay) {
            onAddressChange(null);
            return;
        }
        const provinceName = provinces.find((p) => p.code === selectedProvince)?.name || "";
        const municipalityName = municipalities.find((m) => m.code === selectedMunicipality)?.name || "";
        const barangayName = barangays.find((b) => b.code === selectedBarangay)?.name || "";
        onAddressChange({
            provinceCode: selectedProvince,
            municipalityCode: selectedMunicipality,
            barangayCode: selectedBarangay,
            provinceName,
            municipalityName,
            barangayName,
        });
    }, [selectedProvince, selectedMunicipality, selectedBarangay, onAddressChange]);

    return (
        <div className="space-y-3">
            {/* Province */}
            <div className="space-y-1">
                <Label>Province</Label>
                <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                        {provinces.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Municipality */}
            <div className="space-y-1">
                <Label>Municipality</Label>
                <Select
                    value={selectedMunicipality}
                    onValueChange={handleMunicipalityChange}
                    disabled={municipalities.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={!selectedProvince ? "Select a Province first" : "Select a Municipality"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                        {municipalities.map((m) => (
                            <SelectItem key={m.code} value={m.code}>
                                {m.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Barangay */}
            <div className="space-y-1">
                <Label>Barangay</Label>
                <Select
                    value={selectedBarangay}
                    onValueChange={handleBarangayChange}
                    disabled={barangays.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={!selectedMunicipality ? "Select a Municipality first" : "Select a Barangay"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
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
