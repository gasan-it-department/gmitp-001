import Decedents from '@/actions/App/External/Api/Controllers/Cemetery/Decedents';
import { FormInput } from '@/components/FormInputField';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { DatePicker } from '@/components/Shared/DatePicker';
import { MunicipalitySelect } from '@/components/Shared/MunicipalitySelect';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RegisterDecedentForm } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { useForm } from '@inertiajs/react';
import clsx from 'clsx';
import { FormEvent } from 'react';

interface Props {
    municipality: MunicipalityType;
}

export default function RegisterDecedents({ municipality }: Props) {
    const marinduqueId = '28';

    // We set default to 'standard' so the form loads normally
    const { data, setData, post, processing, errors } = useForm<RegisterDecedentForm>({
        decedent_type: 'standard', // MOVED TO TOP OF STATE
        has_official_name: true, // Helper for fetal/child
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        reference_document_number: '', // Added for 'unknown'
        reference_document_type: '', // Added for 'fetal/child' without names
        date_of_birth: '',
        date_of_death: '',
        date_of_registration: '',
        gender: '',
        cause_of_death: '',
        death_certificate_no: '',
        notes: '',
        place_of_death: '',
        psgc_municipal_id: '',
        psgc_barangay_id: '',
        street_name: '',
        memorial_name: '',
    });
    console.log(data.has_official_name);
    const handleTypeChange = (type: RegisterDecedentForm['decedent_type']) => {
        setData((prevData) => {
            let newData = { ...prevData, decedent_type: type };

            if (type === 'standard') {
                newData.has_official_name = true;
                newData.memorial_name = '';
                newData.reference_document_type = '';
                newData.reference_document_number = '';
            } else if (type === 'unknown') {
                newData.first_name = '';
                newData.middle_name = '';
                newData.last_name = '';
                newData.suffix = '';
                newData.memorial_name = '';
                newData.has_official_name = false;
            } else if (type === 'fetal' || type === 'child') {
                newData.reference_document_type = '';
                newData.reference_document_number = '';
                newData.has_official_name = true;
            }

            return newData;
        });
    };

    const handleOfficialNameToggle = (isChecked: boolean) => {
        setData((prevData) => {
            let newData = { ...prevData, has_official_name: isChecked };

            if (isChecked) {
                // If they check it, wipe the memorial name
                newData.memorial_name = '';
            } else {
                // If they uncheck it, wipe the standard first/middle names
                // (We keep last_name because your UI still asks for family last name)
                newData.first_name = '';
                newData.middle_name = '';
                newData.suffix = '';
                newData.last_name = '';
            }

            return newData;
        });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(Decedents.RegisterDecedentController.url(), {
            headers: {
                'X-Municipality-Slug': municipality.slug,
            },
        });
    };
    const showFullNameFields = data.decedent_type === 'standard' || (data.decedent_type !== 'unknown' && data.has_official_name);
    return (
        <AppLayout>
            <div className="m-10 max-w-7xl space-y-10 py-6 md:m-4 lg:mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Register Decedent</h1>
                        <p className="text-sm text-gray-500">Enter the biological and legal records into the municipal registry.</p>
                    </div>
                </div>

                {/* Main Form Canvas */}
                <form onSubmit={submit} className="space-y-6 pb-24 md:max-w-7xl lg:min-w-7xl">
                    {/* Card 1: Personal Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>

                            {/* THE HIERARCHY SELECTOR: Placed right at the top right of the card */}
                            <div className="grid min-w-md grid-cols-2 items-start justify-end gap-6">
                                <div className="col-span-1 flex flex-col">
                                    <DatePicker
                                        label="Date of Registration"
                                        disableFuture={true}
                                        value={data.date_of_registration}
                                        onChange={(value) => setData('date_of_registration', value)}
                                        error={errors.date_of_registration}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Registration Type:</label>
                                    <Select value={data.decedent_type} onValueChange={handleTypeChange}>
                                        <SelectTrigger className="w-[200px] border-indigo-300 ring-indigo-100 focus:ring-4">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="standard">Standard Adult</SelectItem>
                                                <SelectItem value="child">Child</SelectItem>
                                                <SelectItem value="fetal">Fetal / Infant</SelectItem>
                                                <SelectItem value="unknown">Unidentified / Unknown</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* --- DYNAMIC UI: UNKNOWN CASES --- */}
                        {data.decedent_type === 'unknown' && (
                            <div className="mb-6 rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
                                {/* Inside your dynamic Unknown UI block */}

                                <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <h4 className="mb-2 text-sm font-semibold text-slate-800">Legal Authorization (Required)</h4>
                                        <p className="mb-3 text-xs text-slate-500">
                                            By law, unidentified remains must be authorized for burial by a government agency.
                                        </p>
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        <label className="block text-sm font-medium text-gray-700">AUTHORIZING DOCUMENT *</label>
                                        <Select value={data.reference_document_type} onValueChange={(val) => setData('reference_document_type', val)}>
                                            <SelectTrigger
                                                className={clsx('', errors.reference_document_type && 'border-red-500 focus:ring-red-500')}
                                            >
                                                <SelectValue placeholder="Select Document Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* For crime or found bodies */}
                                                <SelectItem value="PNP Police Blotter">PNP Police Blotter</SelectItem>
                                                <SelectItem value="Medico-Legal Report">Medico-Legal Report</SelectItem>

                                                {/* For homeless/illness deaths on the street */}
                                                <SelectItem value="MHO Burial Clearance">MHO (Health Office) Clearance</SelectItem>
                                                <SelectItem value="DSWD Case Report">DSWD Case Report</SelectItem>
                                                <SelectItem value="Mayor's Clearance">Mayor's Office Clearance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.reference_document_type && (
                                            <span className="animate-pulse text-sm text-red-500">{errors.reference_document_type}</span>
                                        )}
                                    </div>

                                    <div>
                                        <FormInput
                                            id="reference_document_number"
                                            value={data.reference_document_number}
                                            onChange={(e) => setData('reference_document_number', e.target.value)}
                                            label="DOCUMENT / CASE NUMBER *"
                                            isUppercase={true}
                                            error={errors.reference_document_number}
                                            placeholder="e.g., BLOTTER-2026-001"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DYNAMIC UI: FETAL/CHILD WITHOUT NAMES --- */}
                        {(data.decedent_type === 'fetal' || data.decedent_type === 'child') && (
                            <div className="mb-6 flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                                <input
                                    type="checkbox"
                                    id="has_name"
                                    checked={data.has_official_name}
                                    onChange={(e) => handleOfficialNameToggle(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="has_name" className="font-medium">
                                    Does this record have an official registered first name?
                                </label>
                            </div>
                        )}

                        {/* --- STANDARD NAME FIELDS (Hidden if unknown, or if fetal without name) --- */}
                        {data.decedent_type !== 'unknown' && (
                            <>
                                {showFullNameFields ? (
                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div className="md:col-span-1">
                                            <FormInput
                                                id="first_name"
                                                placeholder="ENTER FIRST NAME"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                label="FIRST NAME"
                                                isUppercase={true}
                                                error={errors.first_name}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <FormInput
                                                id="middle_name"
                                                placeholder="ENTER MIDDLE NAME"
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                                label="MIDDLE NAME"
                                                isUppercase={true}
                                                error={errors.middle_name}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <FormInput
                                                id="last_name"
                                                value={data.last_name}
                                                placeholder="ENTER LASTNAME"
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                label="LAST NAME"
                                                isUppercase={true}
                                                error={errors.last_name}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <FormInput
                                                id="suffix"
                                                placeholder="ENTER SUFFIX"
                                                value={data.suffix}
                                                onChange={(e) => setData('suffix', e.target.value)}
                                                label="SUFFIX"
                                                isUppercase={true}
                                                error={errors.suffix}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6 max-w-md">
                                        <FormInput
                                            id="memorial_name"
                                            placeholder="ENTER MEMORIAL NAME IF NO OFFICIAL NAME"
                                            value={data.memorial_name}
                                            onChange={(e) => setData('memorial_name', e.target.value)}
                                            label="MOTHER/FATHER'S LAST NAME (MEMORIAL NAME)"
                                            isUppercase={true}
                                            error={errors.memorial_name}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mt-6 mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <DatePicker
                                    label="Date of Birth"
                                    disableFuture={true}
                                    value={data.date_of_birth}
                                    onChange={(value) => setData('date_of_birth', value)}
                                    error={errors.date_of_birth}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">GENDER</label>
                                <Select value={data.gender} onValueChange={(value) => setData('gender', value as RegisterDecedentForm['gender'])}>
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="male">MALE</SelectItem>
                                            <SelectItem value="female">FEMALE</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Location Fields */}
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <MunicipalitySelect
                                provinceId={marinduqueId}
                                value={data.psgc_municipal_id}
                                onChange={(value) => setData('psgc_municipal_id', value)}
                            />
                            <BarangaySelect
                                municipalityId={data.psgc_municipal_id}
                                value={data.psgc_barangay_id}
                                onChange={(value) => setData('psgc_barangay_id', value)}
                            />
                            <FormInput
                                id="street"
                                label="STREET"
                                placeholder="eg. STA. ANA"
                                isUppercase={true}
                                value={data.street_name}
                                onChange={(e) => setData('street_name', e.target.value)}
                                error={errors.street_name}
                            />
                        </div>
                    </div>

                    {/* Card 2: Mortality & Legal Details */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">Mortality & Legal Record</h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <DatePicker
                                    disableFuture={true}
                                    label="DATE OF DEATH"
                                    value={data.date_of_death}
                                    onChange={(value) => setData('date_of_death', value)}
                                    error={errors.date_of_death}
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="cause_of_death"
                                    placeholder="ENTER CAUSE OF DEATH LEAVE BLANK IF NO INFO"
                                    value={data.cause_of_death}
                                    onChange={(e) => setData('cause_of_death', e.target.value)}
                                    label="CAUSE OF DEATH"
                                    error={errors.cause_of_death}
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="death_certificate_no"
                                    value={data.death_certificate_no}
                                    placeholder="ENTER REGISTRY NO."
                                    onChange={(e) => setData('death_certificate_no', e.target.value)}
                                    label="DEATH CERTIFICATE NO."
                                    error={errors.death_certificate_no}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <FormInput
                                    id="place_of_death"
                                    placeholder="ENTER PLACE OF DEATH"
                                    value={data.place_of_death}
                                    onChange={(e) => setData('place_of_death', e.target.value)}
                                    label="PLACE OF DEATH (Hospital/Location)"
                                    error={errors.place_of_death}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Administrative Notes */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">Administrative</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Remarks / Notes</label>
                            <Textarea
                                value={data.notes}
                                placeholder="ADDITIONAL INFORMATION FOR THE DECEDENT"
                                onChange={(e) => setData('notes', e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.notes ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'}`}
                            />
                            {errors.notes && <span className="animate-pulse text-sm text-red-500">{errors.notes}</span>}
                        </div>
                    </div>

                    {/* Sticky Action Footer */}
                    <div className="fixed right-0 bottom-0 left-0 z-10 flex justify-end gap-3 border-t bg-white p-4 px-8 md:left-64">
                        <button
                            onClick={() => window.history.back()}
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Registry Record'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
