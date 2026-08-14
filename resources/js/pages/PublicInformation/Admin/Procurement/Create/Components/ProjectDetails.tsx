import { FormInput } from '@/components/FormInputField';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Department } from '@/Core/Types/Department/department';
import { FundingSource, ProcurementFormData, ProcurementSelectOption } from '@/Core/Types/Procurement/procurement';

interface ProjectDetailsProps {
    data: ProcurementFormData;
    setData: <K extends keyof ProcurementFormData>(field: K, value: ProcurementFormData[K]) => void;
    errors: Partial<Record<keyof ProcurementFormData, string>>;
    processing: boolean;
    fundingSources: FundingSource[];
    statuses: ProcurementSelectOption[];
    categories: ProcurementSelectOption[];
    departments: Department[];
    isHistorical: boolean;
}

export const ProjectDetails = ({
    data,
    setData,
    errors,
    processing,
    fundingSources,
    statuses,
    categories,
    departments,
    isHistorical,
}: ProjectDetailsProps) => {
    const selectedFundingSource = fundingSources?.find((source) => source.id === data.funding_source_id);
    const isOthersFundingSource = selectedFundingSource?.code === 'OTHERS';

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Reference Number - Keeps standard width */}
            <div>
                <FormInput
                    label="Reference Number"
                    id="reference_number"
                    isUppercase={true}
                    value={data.reference_number}
                    onChange={(e) => setData('reference_number', e.target.value)}
                    disabled={processing}
                    error={errors.reference_number}
                    placeholder=""
                />
                <p className="mt-1.5 text-[0.8rem] text-muted-foreground">Must be unique for every project.</p>
            </div>
            {/* Status - Sits next to Reference Number */}
            {isHistorical && (
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-gray-700">Current Status</Label>
                    <div className="relative">
                        <Select
                            value={data.status}
                            onValueChange={(value) => {
                                setData('status', value);
                                if (value !== 'cancelled') setData('notes', null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses &&
                                    statuses
                                        .filter((status) => status.value !== 'draft')
                                        .map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {errors.status && <span className="text-sm text-red-500">{errors.status}</span>}
                </div>
            )}
            {/* Project Title - SPANS FULL WIDTH */}
            <div className="md:col-span-2">
                <FormInput
                    label="Project Title"
                    id="title"
                    value={data.title}
                    isUppercase={true}
                    onChange={(e) => setData('title', e.target.value)}
                    disabled={processing}
                    error={errors.title}
                    placeholder="e.g. Construction of Multi-Purpose Hall Phase II"
                />
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Project description and public purpose
                </Label>
                <Textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(event) => setData('description', event.target.value)}
                    disabled={processing}
                    aria-invalid={Boolean(errors.description)}
                    placeholder="Explain what will be purchased or built, who benefits, and where the project will be delivered."
                    className={`mt-1.5 min-h-28 resize-y ${errors.description ? 'border-destructive' : ''}`}
                />
                <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
                    This summary is shown to citizens, so use plain language and include the intended location or beneficiaries when relevant.
                </p>
                {errors.description && <span className="mt-1 block text-sm text-red-500">{errors.description}</span>}
            </div>
            {/* Category - Standard width */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">Category</Label>

                <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                    <SelectTrigger className={`w-full ${errors.category ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories &&
                            categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                {errors.category && <span className="animate-pulse text-sm text-red-500">{errors.category}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">Department</Label>
                <Select value={data.department_id || ''} onValueChange={(value) => setData('department_id', value)}>
                    <SelectTrigger className={errors.department_id ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments &&
                            departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                {errors.department_id && <span className="animate-pulse text-sm text-red-500">{errors.department_id}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Funding Source <span className="text-red-500">*</span>
                </label>

                <Select value={data.funding_source_id || ''} onValueChange={(val) => setData('funding_source_id', val)}>
                    <SelectTrigger className={errors.funding_source_id ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Funding Source" />
                    </SelectTrigger>

                    <SelectContent>
                        {fundingSources &&
                            fundingSources.map((source) => (
                                <SelectItem key={source.id} value={source.id}>
                                    {source.label || `${source.code} - ${source.name}`}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                {errors.funding_source_id && <span className="animate-pulse text-sm text-red-500">{errors.funding_source_id}</span>}

                {isOthersFundingSource && (
                    <div className="mt-3">
                        <FormInput
                            label="Specify Funding Source"
                            id="custom_funding_source"
                            value={data.custom_funding_source || ''}
                            onChange={(e) => setData('custom_funding_source', e.target.value)}
                            disabled={processing}
                            error={errors.custom_funding_source}
                            placeholder="e.g. NGO Grant, Private Donation"
                            required
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
