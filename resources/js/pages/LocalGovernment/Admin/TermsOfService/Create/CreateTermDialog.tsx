import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import government from '@/routes/government';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CalendarClock, CalendarCog, CalendarPlus, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';

// --- TYPES ---
// This is what the DB expects (snake_case)
interface TermPayload {
    name: string;
    statutory_start: string; // YYYY-MM-DD
    statutory_end: string; // YYYY-MM-DD
    is_current: boolean;
}

// This is what the UI Form uses (cleaner state)
interface TermFormState {
    start_year: string;
    end_year: string;
    label: string;
    is_active: boolean;
}

interface CreateTermDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // Replace 'any' with your TermResource type if available
}

export default function CreateTermDialog({ isOpen, onClose, initialData }: CreateTermDialogProps) {
    const isEditMode = !!initialData;
    const { currentMunicipality } = useMunicipality();
    // --- INERTIA FORM ---
    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<TermFormState>({
        start_year: new Date().getFullYear().toString(),
        end_year: (new Date().getFullYear() + 3).toString(),
        label: '',
        is_active: false,
    });

    // --- EFFECT: SYNC DATA ON OPEN ---
    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (initialData) {
                // Parse the existing full dates back to years for the UI
                // Example: "2022-06-30" -> "2022"
                setData({
                    start_year: initialData.statutoryStart.split('-')[0],
                    end_year: initialData.statutoryEnd.split('-')[0],
                    label: initialData.name,
                    is_active: initialData.isCurrent,
                });
            } else {
                // Reset to defaults for "Create New"
                reset();
            }
        }
    }, [isOpen, initialData]);

    // --- SUBMIT HANDLER ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Transform the data before it leaves the form
        transform((data) => ({
            name: data.label.trim() || `${data.start_year}-${data.end_year} TERM`,
            statutory_start: `${data.start_year}-06-30`,
            statutory_end: `${data.end_year}-06-30`,
            is_current: data.is_active,
        }));

        // 2. Define your URL using Wayfinder
        const url = isEditMode ? government.admin.terms.update.url({ id: initialData.id }) : government.admin.terms.store.url();

        // 3. Merge headers into the options object
        const requestOptions = {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                onClose();
                reset();
            },
            preserveScroll: true,
            // Add any other existing options here
        };

        // 4. Execute the call (Inertia only takes TWO arguments)
        if (isEditMode) {
            put(url, requestOptions);
        } else {
            post(url, requestOptions);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="overflow-hidden rounded-2xl border-0 p-0 shadow-2xl sm:max-w-[450px]">
                {/* Header */}
                <div className="border-b border-slate-100 bg-white px-6 pt-8 pb-6">
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
                                {isEditMode ? <CalendarCog className="h-5 w-5" /> : <CalendarPlus className="h-5 w-5" />}
                            </div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                                {isEditMode ? 'Edit' : 'New'}{' '}
                                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Term</span>
                            </DialogTitle>
                        </div>
                        <DialogDescription className="font-medium text-slate-500">
                            {isEditMode ? 'Update the details of this legislative period.' : 'Define a new legislative period.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50/30 px-6 py-6">
                    {/* Year Range Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_year" className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                Start Year
                            </Label>
                            <div className="relative">
                                <CalendarClock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
                                <Input
                                    id="start_year"
                                    type="number"
                                    min="1900"
                                    max="2100"
                                    className={`h-11 border-slate-200 bg-white pl-9 text-lg font-bold focus-visible:ring-blue-500 ${errors.statutory_start ? 'border-red-500 bg-red-50' : ''}`}
                                    value={data.start_year}
                                    onChange={(e) => setData('start_year', e.target.value)}
                                    required
                                />
                            </div>
                            {/* Show backend validation error for statutory_start here */}
                            {errors.statutory_start && <p className="text-xs font-medium text-red-500">{errors.statutory_start}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_year" className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                End Year
                            </Label>
                            <div className="relative">
                                <CalendarClock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
                                <Input
                                    id="end_year"
                                    type="number"
                                    min="1900"
                                    max="2100"
                                    className={`h-11 border-slate-200 bg-white pl-9 text-lg font-bold focus-visible:ring-blue-500 ${errors.statutory_end ? 'border-red-500 bg-red-50' : ''}`}
                                    value={data.end_year}
                                    onChange={(e) => setData('end_year', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.statutory_end && <p className="text-xs font-medium text-red-500">{errors.statutory_end}</p>}
                        </div>
                    </div>

                    {/* Label Input */}
                    <div className="space-y-2">
                        <Label htmlFor="label" className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Label <span className="font-normal text-slate-300 normal-case">(Optional)</span>
                        </Label>
                        <Input
                            id="label"
                            placeholder={`e.g. ${data.start_year}-${data.end_year} TERM`}
                            className="h-11 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-blue-500"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                        />
                        {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
                    </div>

                    {/* Active Toggle Card */}
                    <div
                        className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-300 ${
                            data.is_active ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white'
                        } `}
                    >
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className={`text-sm font-bold ${data.is_active ? 'text-blue-700' : 'text-slate-700'}`}>
                                Set as Current Term
                            </Label>
                            <p className="text-xs font-medium text-slate-500">Mark this period as the active administration.</p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>

                    {/* Global Form Error (if any) */}
                    {Object.keys(errors).length > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>Please correct the errors above.</span>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 font-bold text-slate-500 hover:text-slate-900">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 min-w-[140px] rounded-xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-orange-600 active:scale-95"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {isEditMode ? 'Update Term' : 'Create Term'}
                                    {isEditMode ? <Save className="ml-2 h-4 w-4" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
