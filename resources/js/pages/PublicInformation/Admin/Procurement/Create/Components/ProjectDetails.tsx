import { DepartmentOption } from '@/components/Department/DepartmentOption';
import { FormInput } from '@/components/FormInputField';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcurementFormData } from '@/Core/Types/Procurement/procurement';

interface SelectOption {
    value: string;
    label: string;
    color?: string;
}

interface ProjectDetailsProps {
    data: ProcurementFormData;
    setData: (field: string, value: any) => void;
    errors: any;
    processing: boolean;
    fundingSources: any;
    statuses: SelectOption[];
    categories: SelectOption[];
    isHistorical: boolean;
}

export const ProjectDetails = ({ data, setData, errors, processing, fundingSources, statuses, categories, isHistorical }: ProjectDetailsProps) => {
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
                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses &&
                                    statuses.map((status: SelectOption) => (
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
            {/* Category - Standard width */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">Category</Label>

                <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                    <SelectTrigger className={`w-full ${errors.category ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories &&
                            categories.map((cat: SelectOption) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                {errors.category && <span className="animate-pulse text-sm text-red-500">{errors.category}</span>}
            </div>
            <DepartmentOption
                className="flex flex-col gap-1.5"
                placeholder="Select Department"
                value={data.department_id || ''}
                onValueChange={(value) => setData('department_id', value)}
                error={errors.department_id}
            />

            <div className="flex flex-col gap-1.5">
                <label className="mb-1 block text-sm font-medium text-gray-700">Funding Source</label>

                <Select value={data.funding_source_id || ''} onValueChange={(val) => setData('funding_source_id', val)}>
                    <SelectTrigger className={errors.funding_source_id ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select Funding Source" />
                    </SelectTrigger>

                    <SelectContent>
                        {/* Optional: Add an item for the "None/Null" state */}
                        <SelectItem value="none">None / To be determined</SelectItem>

                        {fundingSources &&
                            fundingSources.map((source: any) => (
                                <SelectItem key={source.id} value={source.id}>
                                    {source.label || `${source.code} - ${source.name}`}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                {errors.funding_source_id && <span className="animate-pulse text-sm text-red-500">{errors.funding_source_id}</span>}
            </div>
        </div>
    );
};
