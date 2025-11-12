import { usePage } from "@inertiajs/react";

type Municipality = {
    id: string;
    name: string;
    slug: string;
    zip_code: string;
};

export function HeaderNav() {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    console.log(currentMunicipality.slug); // ✅ fully typed

}
