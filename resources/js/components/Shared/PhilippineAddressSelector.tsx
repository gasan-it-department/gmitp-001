import { useEffect, useState } from 'react';
import { BarangaySelect } from './BarangaySelect';
import { MunicipalitySelect } from './MunicipalitySelect';
import { ProvinceSelect } from './ProvinceSelect';
import { RegionSelect } from './RegionSelect';

interface AddressSelection {
    residence_region_id: number | null;
    residence_province_id: number | null;
    residence_municipality_id: number | null;
    residence_barangay_id: number | null;
}

interface Props {
    onAddressChange?: (address: AddressSelection) => void;
}

export function PhilippineAddressSelector({ onAddressChange }: Props) {
    const [regionId, setRegionId] = useState('');
    const [provinceId, setProvinceId] = useState('');
    const [municipalityId, setMunicipalityId] = useState('');
    const [barangayId, setBarangayId] = useState('');

    const [hasNoProvinces, setHasNoProvinces] = useState(false);

    // Notify parent whenever any ID changes
    useEffect(() => {
        if (onAddressChange) {
            onAddressChange({
                residence_region_id: regionId ? Number(regionId) : null,
                residence_province_id: hasNoProvinces || !provinceId ? null : Number(provinceId),
                residence_municipality_id: municipalityId ? Number(municipalityId) : null,
                residence_barangay_id: barangayId ? Number(barangayId) : null,
            });
        }
    }, [regionId, provinceId, municipalityId, barangayId, hasNoProvinces, onAddressChange]);

    // Cascading Handlers (Resetting lower levels when upper levels change)
    const handleRegionChange = (val: string) => {
        setRegionId(val);
        setProvinceId('');
        setMunicipalityId('');
        setBarangayId('');
    };

    const handleProvinceChange = (val: string) => {
        setProvinceId(val);
        setMunicipalityId('');
        setBarangayId('');
    };

    const handleMunicipalityChange = (val: string) => {
        setMunicipalityId(val);
        setBarangayId('');
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RegionSelect value={regionId} onChange={handleRegionChange} />

            <ProvinceSelect regionId={regionId} value={provinceId} onChange={handleProvinceChange} onBypassCheck={setHasNoProvinces} />

            <MunicipalitySelect
                regionId={regionId}
                provinceId={provinceId}
                isBypassed={hasNoProvinces}
                value={municipalityId}
                onChange={handleMunicipalityChange}
            />

            <BarangaySelect municipalityId={municipalityId} value={barangayId} onChange={setBarangayId} />
        </div>
    );
}
