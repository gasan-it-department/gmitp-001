export interface MunicipalityType {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
    municipal_code: string;
    is_active?: boolean;
    settings?: any
}

export interface Municipality {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
    municipal_code: string;
    is_active?: boolean;
    settings?: any
}

export interface MunicipalResponse {
    name: string;
    code: string;
}