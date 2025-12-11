import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";

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
    editProvince,
    editMunicipality,
    editBarangay,
}: AddressDropdownProps) {
    const BASE = "https://psgc.gitlab.io/api";
    const [provinces] = useState<LocationItem[]>(PROVINCES);
    const [municipalities, setMunicipalities] = useState<LocationItem[]>([]);
    const [barangays, setBarangays] = useState<LocationItem[]>([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const fetchMunicipalities = useCallback(async (provinceCode: string) => {
        if (!provinceCode) return [];
        try {
            const res = await fetch(`${BASE}/provinces/${provinceCode}/municipalities/`);
            const data: LocationItem[] = await res.json();
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            setMunicipalities(sorted);
            return sorted;
        } catch (error) {
            console.error("Failed to fetch municipalities", error);
            return [];
        }
    }, []);

    const fetchBarangays = useCallback(async (municipalityCode: string) => {
        if (!municipalityCode) return [];
        try {
            const res = await fetch(`${BASE}/municipalities/${municipalityCode}/barangays/`);
            const data: LocationItem[] = await res.json();
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            setBarangays(sorted);
            return sorted;
        } catch (error) {
            console.error("Failed to fetch barangays", error);
            return [];
        }
    }, []);

    const init = useCallback(async () => {
        // If we are not in edit mode, initialize immediately
        if (!editProvince) {
            setIsInitialized(true);
            return;
        }

        setIsLoading(true);
        try {
            // 1. Set State Immediately
            setSelectedProvince(editProvince);
            setSelectedMunicipality(editMunicipality || "");
            setSelectedBarangay(editBarangay || "");

            // 2. Fetch Data
            await fetchMunicipalities(editProvince);

            if (editMunicipality) {
                await fetchBarangays(editMunicipality);
            }

        } catch (error) {
            console.error("Init Error", error);
        } finally {
            setIsLoading(false);
            // ⭐️ Crucial: Mark as initialized only after all async operations complete
            setIsInitialized(true);
        }
    }, [editProvince, editMunicipality, editBarangay, fetchMunicipalities, fetchBarangays]);

    useEffect(() => {
        init();
    }, [init]);

    // Handlers (remain the same for user interaction)
    const handleProvinceChange = async (code: string) => {
        setSelectedProvince(code);
        setSelectedMunicipality("");
        setSelectedBarangay("");
        setMunicipalities([]);
        setBarangays([]);
        await fetchMunicipalities(code);
    };

    const handleMunicipalityChange = async (code: string) => {
        setSelectedMunicipality(code);
        setSelectedBarangay("");
        setBarangays([]);
        await fetchBarangays(code);
    };

    const handleBarangayChange = (code: string) => {
        setSelectedBarangay(code);
    };

    // Output Effect (Remains the same)
    useEffect(() => {
        if (!isInitialized || isLoading) {
            onAddressChange(null);
            return;
        }

        if (!selectedProvince) {
            onAddressChange(null);
            return;
        }

        const provinceName = provinces.find(p => String(p.code) === String(selectedProvince))?.name || "";
        const municipalityName = municipalities.find(m => String(m.code) === String(selectedMunicipality))?.name || "";
        const barangayName = barangays.find(b => String(b.code) === String(selectedBarangay))?.name || "";

        onAddressChange({
            provinceCode: selectedProvince,
            municipalityCode: selectedMunicipality,
            barangayCode: selectedBarangay,
            provinceName,
            municipalityName,
            barangayName,
        });
    }, [selectedProvince, selectedMunicipality, selectedBarangay, onAddressChange, provinces, municipalities, barangays, isLoading, isInitialized]);

    // Manual Name Lookups (Memoized and String Safe)
    const currentMuniName = useMemo(() =>
        municipalities.find(m => String(m.code) === String(selectedMunicipality))?.name,
        [municipalities, selectedMunicipality]);

    const currentBrgyName = useMemo(() =>
        barangays.find(b => String(b.code) === String(selectedBarangay))?.name,
        [barangays, selectedBarangay]);

    const LoadingPlaceholder = ({ text }: { text: string }) => (
        <div className="flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading {text}...</span>
        </div>
    );

    // 🛑 Render nothing but the placeholder if we are in edit mode and haven't initialized
    if (editProvince && !isInitialized) {
        return (
            <div className="space-y-3">
                <LoadingPlaceholder text="Address Data" />
                <LoadingPlaceholder text="Address Data" />
                <LoadingPlaceholder text="Address Data" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Province - Always rendered after init */}
            <div className="space-y-1">
                <Label>Province</Label>
                <Select value={selectedProvince} onValueChange={handleProvinceChange} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a Province">
                            {provinces.find(p => String(p.code) === String(selectedProvince))?.name}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                        {provinces.map((p) => (
                            <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Municipality */}
            <div className="space-y-1">
                <Label>Municipality</Label>
                {isLoading && !currentMuniName ? ( // Show placeholder if loading AND no name found (prevents flicker)
                    <LoadingPlaceholder text="Municipalities" />
                ) : (
                    <Select
                        // Key forces remount if list changes size or value changes
                        key={`muni-${municipalities.length}-${selectedMunicipality}`}
                        value={selectedMunicipality}
                        onValueChange={handleMunicipalityChange}
                        disabled={municipalities.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={!selectedProvince ? "Select a Province first" : "Select a Municipality"}>
                                {currentMuniName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            {municipalities.map((m) => (
                                <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Barangay */}
            <div className="space-y-1">
                <Label>Barangay</Label>
                {isLoading && !currentBrgyName ? (
                    <LoadingPlaceholder text="Barangays" />
                ) : (
                    <Select
                        key={`brgy-${barangays.length}-${selectedBarangay}`}
                        value={selectedBarangay}
                        onValueChange={handleBarangayChange}
                        disabled={barangays.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={!selectedMunicipality ? "Select a Municipality first" : "Select a Barangay"}>
                                {currentBrgyName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            {barangays.map((b) => (
                                <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}