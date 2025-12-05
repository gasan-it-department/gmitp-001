export type OfficialsPosition = 'Mayor' | 'Vice Mayor' | 'Councilor' | 'SK Federation President' | 'ABC President';

export interface OfficialsFormData {
    id: string;
    name: string;
    position: OfficialsPosition;
    image: string | null;
}

export interface OfficialsData {
    id: string;
    name: string;
    position: OfficialsPosition;
    image: string | null;
}
