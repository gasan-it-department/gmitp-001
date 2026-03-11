import { FormInput } from '@/components/FormInputField';
import { Label } from '@/components/ui/label';
import { ProcurementFormData } from '@/Core/Types/PublicInformation/PublicInformationTypes';

interface ProjectDetailsProps {
    data: ProcurementFormData;
    setData: (field: string, value: any) => void;
    errors: any;
    processing: boolean;
}

export const ProjectDetails = ({ data, setData, errors, processing }: ProjectDetailsProps) => {
    const categories = [
        { value: 'GOODS', label: 'Goods' },
        { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
        { value: 'CONSULTING', label: 'Consulting Services' },
    ];

    const statuses = [
        { value: 'OPEN', label: 'Open (Bidding Ongoing)' },
        { value: 'CLOSED', label: 'Closed (Bidding Ended)' },
        { value: 'AWARDED', label: 'Awarded' },
        { value: 'FAILED', label: 'Failed' },
    ];

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
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Current Status
                </Label>
                <div className="relative">
                    <select
                        id="status"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        disabled={processing}
                        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors.status ? 'border-red-500 ring-red-500' : 'border-input'
                        }`}
                    >
                        {statuses.map((stat) => (
                            <option key={stat.value} value={stat.value}>
                                {stat.label}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.status && <span className="text-sm text-red-500">{errors.status}</span>}
            </div>

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
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category
                </Label>
                <select
                    id="category"
                    value={data.category}
                    onChange={(e) => setData('category', e.target.value)}
                    disabled={processing}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.category ? 'border-red-500 ring-red-500' : 'border-input'
                    }`}
                >
                    <option value="" disabled>
                        Select a category
                    </option>
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
                {errors.category && <span className="text-sm text-red-500">{errors.category}</span>}
            </div>
        </div>
    );
};
