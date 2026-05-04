import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, FileText, FormInput, MapPin, User } from 'lucide-react';
import { FormEventHandler, useMemo } from 'react';

// Shadcn UI Imports (Adjust paths based on your setup, usually '@/components/ui/...')
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import actionCenter from '@/routes/actionCenter';

interface Props {
    assistanceTypes: { data: [] };
    sexOptions: any;
}

const mockBarangays = ['ANTIPOLO', 'BACONG-BACONG', 'DAWIS', 'PINGGAN', 'TRES REYES'];

export default function CreateAssistanceRequest({ assistanceTypes, sexOptions }: Props) {
    const assistancesData = assistanceTypes.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    // Inertia's useForm hook, perfectly mapped to our StoreAssistanceRequestDto
    const { data, setData, post, processing, errors } = useForm({
        // 1. Address Anchor (Hardcoded to Gasan as discussed)
        province: 'MARINDUQUE',
        municipality: 'GASAN',
        barangay: '',
        street_or_purok: '',

        // 2. Beneficiary Data (The logged-in user)
        first_name: '',
        middle_name: '',
        last_name: '',
        birth_date: '',
        sex: '',

        // 3. Request Data
        contact_number: '',
        assistance_type_id: '',
        description: '',

        // Dynamic Documents Dictionary
        documents: {} as Record<string, File | null>,

        // Legal
        privacy_consent: false,
    });

    // Derived state to know which documents to ask for
    const selectedAssistanceType = useMemo(() => {
        if (!data.assistance_type_id) return null;
        return assistanceTypes.find((type) => type.id === Number(data.assistance_type_id));
    }, [data.assistance_type_id, assistanceTypes]);

    const handleFileChange = (documentName: string, file: File | null) => {
        setData('documents', {
            ...data.documents,
            [documentName]: file,
        });
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(actionCenter.store.url(), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
        });
    };

    return (
        <div className="mx-auto min-h-screen max-w-4xl bg-gray-50/50 px-4 py-10 sm:px-6 lg:px-8">
            <Head title="Request Assistance" />

            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Request Public Assistance</h1>
                <p className="text-sm text-gray-500">
                    Please complete this form to request financial or material aid. Ensure your information matches your uploaded Valid ID.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- SECTION 1: ADDRESS --- */}
                <Card>
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                            Current Address
                        </CardTitle>
                        <CardDescription>Where do you currently reside in Gasan?</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Municipality</Label>
                            <Input disabled value={data.municipality} className="cursor-not-allowed bg-gray-100 font-medium text-gray-500" />
                        </div>

                        <div className="space-y-2">
                            <BarangaySelect municipalityId={} value={} onChange={} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="street">Street / Purok</Label>
                            <FormInput
                                id="street"
                                placeholder="e.g., Purok 1"
                                value={data.street_or_purok}
                                onChange={(e) => setData('street_or_purok', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* --- SECTION 2: BENEFICIARY --- */}
                <Card>
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <User className="mr-2 h-5 w-5 text-blue-600" />
                            Personal Details
                        </CardTitle>
                        <CardDescription>Legal information of the primary recipient.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input className="uppercase" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                            {errors.first_name && <span className="text-xs text-red-500">{errors.first_name}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Middle Name</Label>
                            <Input className="uppercase" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input className="uppercase" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                            {errors.last_name && <span className="text-xs text-red-500">{errors.last_name}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Suffix <span className="text-red-500">*</span>
                            </Label>
                            <Input className="uppercase" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                            {errors.last_name && <span className="text-xs text-red-500">{errors.last_name}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Birth Date <span className="text-red-500">*</span>
                            </Label>
                            <Input type="date" value={data.birth_date} onChange={(e) => setData('birth_date', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Sex <span className="text-red-500">*</span>
                            </Label>
                            <Select onValueChange={(value) => setData('sex', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sexOptions.map((sex: any) => (
                                        <SelectItem key={sex.value} value={sex.value}>
                                            {sex.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Contact Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="09XXXXXXXXX"
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* --- SECTION 3: REQUEST & DOCUMENTS --- */}
                <Card>
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <FileText className="mr-2 h-5 w-5 text-blue-600" />
                            Assistance Request
                        </CardTitle>
                        <CardDescription>What type of support do you need?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label>
                                Type of Assistance <span className="text-red-500">*</span>
                            </Label>
                            <Select onValueChange={(value) => setData('assistance_type_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an assistance program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assistanceTypes.data.map((type: any) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Brief Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Please explain your situation..."
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </div>

                        {/* --- DYNAMIC DOCUMENTS --- */}
                        {selectedAssistanceType && selectedAssistanceType.required_documents.length > 0 && (
                            <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                                <h4 className="mb-4 flex items-center text-sm font-semibold text-blue-900">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Required Documents for {selectedAssistanceType.name}
                                </h4>
                                <div className="space-y-4">
                                    {selectedAssistanceType.required_documents.map((docName) => (
                                        <div key={docName} className="space-y-2">
                                            <Label className="capitalize">
                                                {docName.replace(/_/g, ' ')} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="file"
                                                className="cursor-pointer bg-white file:font-medium file:text-blue-600"
                                                onChange={(e) => handleFileChange(docName, e.target.files ? e.target.files[0] : null)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* --- SUBMIT ACTION --- */}
                <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-500">By submitting, you consent to the processing of your data under the Data Privacy Act.</p>
                    <div className="flex gap-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            {processing && <CheckCircle2 className="mr-2 h-4 w-4 animate-pulse" />}
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
