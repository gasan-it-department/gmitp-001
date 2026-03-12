import Decedents from '@/actions/App/External/Api/Controllers/Cemetery/Decedents';
import { FormInput } from '@/components/FormInputField';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
interface Props {
    municipality: MunicipalityType;
}

export default function RegisterDecedents({ municipality }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        date_of_birth: '',
        date_of_death: '',
        gender: '',
        cause_of_death: '',
        death_certificate_no: '',
        notes: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        // Assuming your Laravel route is named 'decedents.store'
        post(Decedents.RegisterDecedentController.url(), {
            headers: {
                'X-Municipality-Slug': municipality.slug,
            },
        });
    };

    return (
        <AppLayout>
            <div className="m-10 mx-auto max-w-7xl space-y-10 py-6">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Register Decedent</h1>
                        <p className="text-sm text-gray-500">Enter the biological and legal records into the municipal registry.</p>
                    </div>
                </div>

                {/* Main Form Canvas */}
                <form onSubmit={submit} className="max-w-5xl space-y-6 pb-24">
                    {/* Card 1: Personal Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">Personal Information</h2>

                        {/* CSS Grid for Name Fields */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="md:col-span-1">
                                <FormInput
                                    id="first_name"
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
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    label="LAST NAME"
                                    isUppercase={true}
                                    error={errors.last_name}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <FormInput
                                    id="suffix"
                                    value={data.suffix}
                                    onChange={(e) => setData('suffix', e.target.value)}
                                    label="SUFFIX"
                                    isUppercase={true}
                                    error={errors.suffix}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="MALE">MALE</SelectItem>
                                            <SelectItem value="FEMALE">FEMALE</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                    value={data.cause_of_death}
                                    onChange={(e) => setData('cause_of_death', e.target.value)}
                                    label="CAUSE OF DEATH"
                                    error={errors.cause_of_death}
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="cause_of_death"
                                    value={data.death_certificate_no}
                                    onChange={(e) => setData('death_certificate_no', e.target.value)}
                                    label="DEATH CERTIFICATE NO."
                                    error={errors.death_certificate_no}
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
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Sticky Action Footer */}
                    <div className="fixed right-0 bottom-0 left-0 z-10 flex justify-end gap-3 p-4 px-8 md:left-64">
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
