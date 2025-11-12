import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useState } from "react";

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
    errors?: {
        provinceCode?: string;
        municipalityCode?: string;
        barangayCode?: string;
    };
}

const PROVINCES: LocationItem[] = [{ code: "174000000", name: "Marinduque" }];

export function AddressDropdown({
    onAddressChange,
    editProvince = "",
    editMunicipality = "",
    editBarangay = "",
    errors = {},
}: AddressDropdownProps) {
    const BASE = "https://psgc.gitlab.io/api";
    const [provinces] = useState<LocationItem[]>(PROVINCES);
    const [municipalities, setMunicipalities] = useState<LocationItem[]>([]);
    const [barangays, setBarangays] = useState<LocationItem[]>([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");

    const [selectedNames, setSelectedNames] = useState({
        provinceName: "",
        municipalityName: "",
        barangayName: "",
    });

    // 🔹 Initialize values in edit mode
    useEffect(() => {
        const initEditData = async () => {
            try {
                if (!editProvince) return;
                let provinceName = "";
                let municipalityName = "";
                let barangayName = "";

                // Province
                const provinceRes = await fetch(`${BASE}/provinces/${editProvince}/`);
                if (provinceRes.ok) {
                    const data = await provinceRes.json();
                    provinceName = data.name;
                    setSelectedProvince(editProvince);
                }

                // Municipalities list
                const muniListRes = await fetch(
                    `${BASE}/provinces/${editProvince}/municipalities/`
                );
                const muniList = await muniListRes.json();
                setMunicipalities(muniList);

                if (editMunicipality) {
                    const muniRes = await fetch(`${BASE}/municipalities/${editMunicipality}/`);
                    if (muniRes.ok) {
                        const data = await muniRes.json();
                        municipalityName = data.name;
                        setSelectedMunicipality(editMunicipality);
                    }

                    // Barangay list
                    const brgyListRes = await fetch(
                        `${BASE}/municipalities/${editMunicipality}/barangays/`
                    );
                    const brgyList = await brgyListRes.json();
                    setBarangays(brgyList);
                }

                if (editBarangay) {
                    const brgyRes = await fetch(`${BASE}/barangays/${editBarangay}/`);
                    if (brgyRes.ok) {
                        const data = await brgyRes.json();
                        barangayName = data.name;
                        setSelectedBarangay(editBarangay);
                    }
                }

                setSelectedNames({
                    provinceName,
                    municipalityName,
                    barangayName,
                });
            } catch (err) {
                console.error("Error initializing edit address:", err);
            }
        };

        initEditData();
    }, [editProvince, editMunicipality, editBarangay]);

    // 🔹 Handle cascading dropdowns
    const handleSelectChange = useCallback(
        async (
            setter: React.Dispatch<React.SetStateAction<string>>,
            nameKey: keyof typeof selectedNames,
            options: LocationItem[],
            value: string
        ) => {
            const name = options.find((o) => o.code === value)?.name || "";
            setter(value);
            setSelectedNames((prev) => ({ ...prev, [nameKey]: name }));

            if (nameKey === "provinceName") {
                // reset municipality & barangay
                setSelectedMunicipality("");
                setSelectedBarangay("");
                setBarangays([]);
                const res = await fetch(`${BASE}/provinces/${value}/municipalities/`);
                const data: LocationItem[] = await res.json();
                setMunicipalities(data);
            }

            if (nameKey === "municipalityName") {
                // reset barangay
                setSelectedBarangay("");
                const res = await fetch(`${BASE}/municipalities/${value}/barangays/`);
                const data: LocationItem[] = await res.json();
                setBarangays(data);
            }

            // No need to check editProvince/editMunicipality/editBarangay
        },
        []
    );


    // 🔹 Notify parent when address fully selected
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
    }, [
        selectedProvince,
        selectedMunicipality,
        selectedBarangay,
        selectedNames,
        onAddressChange,
    ]);

    return (
        <div className="space-y-3">
            {/* Province */}
            <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-700">
                    Province
                </Label>
                <Select
                    value={selectedProvince}
                    onValueChange={(val) =>
                        handleSelectChange(setSelectedProvince, "provinceName", provinces, val)
                    }
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue
                            placeholder={selectedNames.provinceName || "Select a Province"}
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
                {errors.provinceCode && (
                    <p className="text-xs text-red-500">{errors.provinceCode}</p>
                )}
            </div>

            {/* Municipality */}
            <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-700">
                    Municipality
                </Label>
                <Select
                    value={selectedMunicipality}
                    onValueChange={(val) =>
                        handleSelectChange(
                            setSelectedMunicipality,
                            "municipalityName",
                            municipalities,
                            val
                        )
                    }
                    disabled={municipalities.length === 0}
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue
                            placeholder={
                                selectedNames.municipalityName ||
                                (!selectedProvince
                                    ? "Select a Province first"
                                    : "Select a Municipality")
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
                {errors.municipalityCode && (
                    <p className="text-xs text-red-500">{errors.municipalityCode}</p>
                )}
            </div>

            {/* Barangay */}
            <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-700">
                    Barangay
                </Label>
                <Select
                    value={selectedBarangay}
                    onValueChange={(val) =>
                        handleSelectChange(
                            setSelectedBarangay,
                            "barangayName",
                            barangays,
                            val
                        )
                    }
                    disabled={barangays.length === 0}
                >
                    <SelectTrigger className="font-medium text-gray-600">
                        <SelectValue
                            placeholder={
                                selectedNames.barangayName ||
                                (!selectedMunicipality
                                    ? "Select a Municipality first"
                                    : "Select a Barangay")
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
                {errors.barangayCode && (
                    <p className="text-xs text-red-500">{errors.barangayCode}</p>
                )}
            </div>
        </div>
    );
}
