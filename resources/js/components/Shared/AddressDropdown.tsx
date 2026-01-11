import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Hardcoded for Marinduque context
const PROVINCE_CODE = '174000000';
const PROVINCE_NAME = 'Marinduque';
const BASE_API = 'https://psgc.gitlab.io/api';

interface AddressData {
    province: string;
    municipality: string;
    barangay: string;
}

interface AddressDropdownProps {
    editMunicipality?: string;
    editBarangay?: string;
    onAddressChange: (address: AddressData | null) => void;

    errorMunicipality?: string;
    errorBarangay?: string;
}

type LocationItem = { code: string; name: string };

export function AddressDropdown({ onAddressChange, editMunicipality, editBarangay, errorMunicipality, errorBarangay }: AddressDropdownProps) {
    const [municipalities, setMunicipalities] = useState<LocationItem[]>([]);
    const [barangays, setBarangays] = useState<LocationItem[]>([]);

    // We still track CODES internally to make the API work, but we output NAMES
    const [selectedMuniCode, setSelectedMuniCode] = useState<string>('');
    const [selectedBrgyCode, setSelectedBrgyCode] = useState<string>('');
    const [isFetchingBrgy, setIsFetchingBrgy] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // --- API HANDLERS ---

    const fetchMunicipalities = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_API}/provinces/${PROVINCE_CODE}/municipalities/`);
            const data: LocationItem[] = await res.json();
            return data.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch municipalities', error);
            return [];
        }
    }, []);

    const fetchBarangays = useCallback(async (muniCode: string) => {
        if (!muniCode) return [];
        try {
            const res = await fetch(`${BASE_API}/municipalities/${muniCode}/barangays/`);
            const data: LocationItem[] = await res.json();
            return data.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch barangays', error);
            return [];
        }
    }, []);

    // --- INITIALIZATION (Reverse Lookup: Name -> Code) ---
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);

            // 1. Get all Munis
            const muniList = await fetchMunicipalities();
            setMunicipalities(muniList);

            // 2. Handle Edit Mode (Map Name "Gasan" -> Code "174003000")
            if (editMunicipality) {
                const matchMuni = muniList.find((m) => m.name === editMunicipality);

                if (matchMuni) {
                    setSelectedMuniCode(matchMuni.code);

                    // 3. Get Barangays for found Muni
                    const brgyList = await fetchBarangays(matchMuni.code);
                    setBarangays(brgyList);

                    // 4. Handle Brgy Edit (Map Name "Pinggan" -> Code)
                    if (editBarangay) {
                        const matchBrgy = brgyList.find((b) => b.name === editBarangay);
                        if (matchBrgy) setSelectedBrgyCode(matchBrgy.code);
                    }
                }
            }
            setIsLoading(false);
        };

        init();
    }, [editMunicipality, editBarangay, fetchMunicipalities, fetchBarangays]);

    // --- USER INTERACTION HANDLERS ---

    const handleMuniChange = async (code: string) => {
        setSelectedMuniCode(code);
        setSelectedBrgyCode(''); // Reset barangay
        setIsFetchingBrgy(true);

        // Fetch new barangays
        const brgyList = await fetchBarangays(code);
        setBarangays(brgyList);
        setIsFetchingBrgy(false);
        // Find Name to send to parent
        const muniName = municipalities.find((m) => m.code === code)?.name || '';

        // Update Parent immediately with partial address
        onAddressChange({
            province: PROVINCE_NAME,
            municipality: muniName,
            barangay: '',
        });
    };

    const handleBrgyChange = (code: string) => {
        setSelectedBrgyCode(code);

        const muniName = municipalities.find((m) => m.code === selectedMuniCode)?.name || '';
        const brgyName = barangays.find((b) => b.code === code)?.name || '';

        // Update Parent with full address NAMES
        onAddressChange({
            province: PROVINCE_NAME,
            municipality: muniName,
            barangay: brgyName,
        });
    };

    // --- RENDER ---

    const LoadingPlaceholder = ({ text }: { text: string }) => (
        <div className="flex h-11 w-full items-center justify-start rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm opacity-60">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-400" />
            <span className="text-slate-500 italic">Loading {text}...</span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 1. PROVINCE (Static) */}
            <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Province</Label>
                <div className="flex h-11 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-600 select-none">
                    <MapPin size={14} className="text-orange-500" />
                    {PROVINCE_NAME}
                </div>
            </div>

            {/* 2. MUNICIPALITY */}
            <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Municipality</Label>
                {isLoading && municipalities.length === 0 ? (
                    <LoadingPlaceholder text="Municipalities" />
                ) : (
                    <Select value={selectedMuniCode} onValueChange={handleMuniChange}>
                        <SelectTrigger
                            className={`h-11 font-semibold ${errorMunicipality ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300'}`}
                        >
                            <SelectValue placeholder="Select Municipality" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 font-semibold text-gray-600">
                            {municipalities.map((m) => (
                                <SelectItem key={m.code} value={m.code}>
                                    {m.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {errorMunicipality && <span className="animate-pulse text-sm text-red-500">{errorMunicipality}</span>}
            </div>

            {/* 3. BARANGAY */}
            <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Barangay</Label>
                {/* Show loading state if municipalities loaded but we are fetching barangays */}
                {isFetchingBrgy ? (
                    <LoadingPlaceholder text="Barangays" />
                ) : (
                    <Select value={selectedBrgyCode} onValueChange={handleBrgyChange} disabled={!selectedMuniCode || barangays.length === 0}>
                        <SelectTrigger className={`h-11 font-semibold ${errorBarangay ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300'}`}>
                            <SelectValue placeholder={!selectedMuniCode ? 'Select Municipality first' : 'Select Barangay'} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 font-semibold text-gray-600">
                            {barangays.map((b) => (
                                <SelectItem key={b.code} value={b.code}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {errorBarangay && <span className="animate-pulse text-sm text-red-500">{errorBarangay}</span>}
            </div>
        </div>
    );
}
