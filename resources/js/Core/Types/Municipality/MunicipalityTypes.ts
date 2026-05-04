export interface MunicipalityType {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
    municipal_code: string;
    is_active?: boolean;
    settings?: MunicipalitySettings;
}

export interface MunicipalityFormData {
    id: string;
    zip_code: string;
    psgc_municipal_id: string;
    is_active: boolean;
}

export interface Municipality {
    id: string;
    psgc_municipal_id: string;
    name: string;
    slug: string;
    zip_code: string;
    municipal_code: string;
    is_active?: boolean;
    settings?: MunicipalitySettings;
}

export interface MunicipalitySettings {
    logo_url: string;
}

export interface MunicipalResponse {
    name: string;
    code: string;
}