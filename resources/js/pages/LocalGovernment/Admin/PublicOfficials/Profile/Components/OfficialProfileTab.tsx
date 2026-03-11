import UpdateOfficialProfileController from '@/actions/App/External/Api/Controllers/Government/Official/UpdateOfficialProfileController';
import { InertiaInput } from '@/components/InputField';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    official: Official;
}

export const OfficialProfileTab = ({ official }: Props) => {
    // 1. Let Inertia handle the form state entirely
    const { currentMunicipality } = useMunicipality();
    const { data, setData, put, processing, errors } = useForm({
        first_name: official.first_name || '',
        middle_name: official.middle_name || '',
        last_name: official.last_name || '',
        suffix: official.suffix || '',
        gender: official.gender || '',
        biography: official.biography || '',
    });

    // 2. Handle the submission
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log(official.id);
        put(UpdateOfficialProfileController.url({ officialId: official.id }), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    return (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <form onSubmit={submit} className="p-8">
                <h2 className="text-base leading-7 font-semibold text-slate-900 dark:text-white">Personal Information</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-zinc-400">Update the core identity details of this official.</p>

                {/* 3. The Tweaked Grid Layout */}
                <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* ROW 1: The Full Name (2 cols each) */}
                    <div className="sm:col-span-2">
                        <InertiaInput
                            label="FIRTS NAME"
                            id="first_name"
                            isUppercase={true}
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                        />
                        {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <InertiaInput
                            label="MIDDLE NAME"
                            id="middle_name"
                            isUppercase={true}
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <InertiaInput
                            label="LAST NAME"
                            id="last_name"
                            isUppercase={true}
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                        />
                        {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                    </div>

                    {/* ROW 2: Suffix, Gender, Email */}
                    <div className="sm:col-span-2">
                        <InertiaInput
                            label="SUFFIX"
                            id="suffix"
                            isUppercase={true}
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                        />
                    </div>

                    <div className="flex h-full flex-col justify-end">
                        <Select value={data.gender || undefined} onValueChange={(value) => setData('gender', value)}>
                            <SelectTrigger className="w-full bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ROW 3: Biography */}
                    <div className="sm:col-span-6">
                        <label className="block text-sm leading-6 font-medium text-slate-900 dark:text-gray-200">Official Biography</label>
                        <Textarea
                            rows={4}
                            value={data.biography}
                            onChange={(e) => setData('biography', e.target.value)}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-slate-900 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-slate-500"
                        />
                        <p className="mt-2 text-xs text-slate-500">Brief history, achievements, and advocacies.</p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-slate-200 pt-6 dark:border-zinc-800">
                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        className="text-sm leading-6 font-semibold text-slate-900 dark:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
