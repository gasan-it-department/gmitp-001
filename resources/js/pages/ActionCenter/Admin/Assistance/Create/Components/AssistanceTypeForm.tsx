import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AssistanceTypeFormData } from '@/Core/Types/ActionCenter/assistance';
import actionCenter from '@/routes/actionCenter';
import { useForm } from '@inertiajs/react';
import { FileText, ShieldAlert, Trash2 } from 'lucide-react';

interface SharedFormProps {
    mode: 'create' | 'edit';
    municipalitySlug: string;
    assistanceTypeId?: string; // Only needed if editing
    initialData: AssistanceTypeFormData;
    documentTypes: { id: string; name: string }[];
    onCancel: () => void; // 🎯 Let the parent wrapper decide how to "go back"
}

export default function AssistanceTypeForm({ mode, municipalitySlug, assistanceTypeId, initialData, documentTypes, onCancel }: SharedFormProps) {
    // 1. Initialize form with whatever data the wrapper passed in
    const { data, setData, post, put, processing, errors } = useForm<AssistanceTypeFormData>(initialData);

    const amountValue = (value: number | null | undefined) => (value === null || value === undefined ? '' : value);

    // --- Handlers ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const headers = { 'X-Municipality-Slug': municipalitySlug };
        const options = {
            preserveScroll: true,
            onSuccess: () => console.log(`Successfully ${mode}d!`),
        };

        // 2. Conditionally Route the Submission
        if (mode === 'create') {
            post(actionCenter.assistance.type.store.url(), { headers, ...options });
        } else {
            if (!assistanceTypeId) return;
            // Uncomment when your update route is ready!
            put(actionCenter.assistance.type.update.url({ typeId: assistanceTypeId }), { headers, ...options });
        }
    };

    // --- Array State Mutations (Immutable) ---
    const addDocument = (documentId: string) => {
        if (data.documents.some((doc) => doc.id === documentId)) return;
        const docToAdd = documentTypes.find((d) => d.id === documentId);
        if (!docToAdd) return;

        setData('documents', [...data.documents, { id: docToAdd.id, name: docToAdd.name, is_required: true }]);
    };

    const removeDocument = (idToRemove: string) => {
        setData(
            'documents',
            data.documents.filter((doc) => doc.id !== idToRemove),
        );
    };

    const toggleRequirement = (idToToggle: string, isRequired: boolean) => {
        setData(
            'documents',
            data.documents.map((doc) => (doc.id === idToToggle ? { ...doc, is_required: isRequired } : doc)),
        );
    };

    return (
        <form id="assistance-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* --- LEFT COLUMN: Core Configuration --- */}
                <div className="space-y-6 lg:col-span-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Basic Information</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Assistance Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., AICS - Medical Assistance"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`bg-gray-50 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                />
                                {errors.name && <p className="text-xs font-medium text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Briefly describe the purpose of this assistance..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="min-h-[120px] resize-none bg-gray-50"
                                />
                            </div>

                            {/* Business Rules Grid (Amount Bounds & Cooldown) */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex flex-col">
                                    <Label htmlFor="min_amount" className="mb-2 flex text-sm font-semibold text-gray-700 md:min-h-[40px] md:items-end">
                                        Minimum Amount Floor (₱)
                                    </Label>
                                    <div className="relative mb-2">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-medium text-gray-500">₱</span>
                                        <Input
                                            id="min_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Leave blank"
                                            value={amountValue(data.min_amount)}
                                            onChange={(e) => setData('min_amount', e.target.value === '' ? null : Number(e.target.value))}
                                            className={`bg-gray-50 pl-8 ${errors.min_amount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.min_amount && <p className="mb-1 text-xs font-medium text-red-600">{errors.min_amount}</p>}
                                    <p className="mt-auto text-xs text-gray-500">Leave blank for no minimum.</p>
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="max_amount" className="mb-2 flex text-sm font-semibold text-gray-700 md:min-h-[40px] md:items-end">
                                        Max Amount Cap (₱)
                                    </Label>
                                    <div className="relative mb-2">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-medium text-gray-500">₱</span>
                                        <Input
                                            id="max_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Leave blank"
                                            value={amountValue(data.max_amount)}
                                            onChange={(e) => setData('max_amount', e.target.value === '' ? null : Number(e.target.value))}
                                            className={`bg-gray-50 pl-8 ${errors.max_amount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.max_amount && <p className="mb-1 text-xs font-medium text-red-600">{errors.max_amount}</p>}
                                    <p className="mt-auto text-xs text-gray-500">Leave blank for no limit.</p>
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="cooldown_months" className="mb-2 flex text-sm font-semibold text-gray-700 md:min-h-[40px] md:items-end">
                                        Cooldown Period
                                    </Label>
                                    <div className="relative mb-2">
                                        <Input
                                            id="cooldown_months"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="e.g., 3"
                                            value={data.cooldown_months}
                                            onChange={(e) => setData('cooldown_months', Number(e.target.value))}
                                            className={`bg-gray-50 pr-16 ${errors.cooldown_months ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">Months</span>
                                    </div>
                                    {errors.cooldown_months && <p className="mb-1 text-xs font-medium text-red-600">{errors.cooldown_months}</p>}
                                    <p className="mt-auto text-xs text-gray-500">Time before re-application.</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100/80">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="font-semibold text-gray-700">Active Status</Label>
                                        <p className="text-xs text-gray-500">Allow citizens to apply for this.</p>
                                    </div>
                                    <Switch checked={data.is_active} onCheckedChange={(c) => setData('is_active', c)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: The Requirement Builder --- */}
                <div className="lg:col-span-7">
                    <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Required Documents</h2>
                                <p className="text-sm text-gray-500">Attach the documents a citizen must submit.</p>
                            </div>
                            <ShieldAlert className="h-6 w-6 text-orange-400" />
                        </div>

                        {/* Combobox / Select Area */}
                        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50/50 p-4">
                            <Label className="mb-2 block text-sm font-semibold text-orange-900">Add a Requirement</Label>
                            <Select onValueChange={addDocument}>
                                <SelectTrigger className="w-full border-orange-300 bg-white shadow-sm focus:ring-orange-500">
                                    <SelectValue placeholder="Select a document type to add..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentTypes?.map((doc) => {
                                        const isSelected = data.documents.some((d) => d.id === doc.id);
                                        return (
                                            <SelectItem key={doc.id} value={doc.id.toString()} disabled={isSelected}>
                                                {doc.name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {/* Validate the array itself if needed */}
                            {errors.documents && <p className="mt-2 text-xs font-medium text-red-600">{errors.documents}</p>}
                        </div>

                        {/* Dynamic Array List */}
                        <div className="space-y-3">
                            {data.documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12 transition-colors hover:border-gray-300 hover:bg-gray-100">
                                    <FileText className="mb-3 h-10 w-10 text-gray-400" />
                                    <p className="font-medium text-gray-600">No documents added yet</p>
                                    <p className="mt-1 text-sm text-gray-500">Select a document from the dropdown above.</p>
                                </div>
                            ) : (
                                data.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{doc.name}</h4>
                                            <div className="mt-2 flex items-center gap-3">
                                                <Switch
                                                    checked={doc.is_required}
                                                    onCheckedChange={(c) => toggleRequirement(doc.id, c)}
                                                    className="data-[state=checked]:bg-red-500"
                                                />
                                                <span className={`text-sm font-medium ${doc.is_required ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {doc.is_required ? 'Mandatory Requirement' : 'Optional (Supporting Only)'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeDocument(doc.id)}
                                            className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STICKY ACTION BAR --- */}
            <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel} // 🎯 Uses the passed prop
                        className="font-semibold text-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-orange-600 px-8 font-semibold text-white shadow-md hover:bg-orange-700">
                        {processing ? 'Saving...' : mode === 'create' ? 'Save Assistance Type' : 'Update Assistance Type'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
