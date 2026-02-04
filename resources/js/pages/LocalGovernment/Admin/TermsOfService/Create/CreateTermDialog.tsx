import { useState, useEffect } from 'react';
import { 
    CalendarPlus, 
    CalendarCog, 
    AlertCircle, 
    Loader2, 
    CheckCircle2,
    CalendarClock,
    Save
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; 

// --- PROPS INTERFACE ---
export interface TermFormData {
    start_year: string;
    end_year: string;
    label: string;
    is_active: boolean;
}

interface CreateTermDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TermFormData) => Promise<void>;
    initialData?: TermFormData | null;
}

export default function CreateTermDialog({ isOpen, onClose, onSubmit, initialData }: CreateTermDialogProps) {
    // --- STATE ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditMode = !!initialData;
    
    // Form State
    const [formData, setFormData] = useState<TermFormData>({
        start_year: '',
        end_year: '',
        label: '',
        is_active: false,
    });

    // Reset or Populate form
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    start_year: initialData.start_year,
                    end_year: initialData.end_year,
                    label: initialData.label,
                    is_active: initialData.is_active,
                });
            } else {
                setFormData({
                    start_year: new Date().getFullYear().toString(),
                    end_year: (new Date().getFullYear() + 3).toString(),
                    label: '',
                    is_active: false,
                });
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    // --- HANDLERS ---
    const handleChange = (field: keyof TermFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const start = parseInt(formData.start_year);
        const end = parseInt(formData.end_year);

        if (isNaN(start) || isNaN(end)) {
            setError("Years must be valid numbers.");
            return;
        }

        if (end <= start) {
            setError("End year must be after start year.");
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError("Failed to save term. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                
                {/* Header - Unified Theme (Always Orange/Slate) */}
                <div className="bg-white px-6 pt-8 pb-6 border-b border-slate-100">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                                {isEditMode ? <CalendarCog className="h-5 w-5" /> : <CalendarPlus className="h-5 w-5" />}
                            </div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                                {isEditMode ? 'Edit' : 'New'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Term</span>
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-500 font-medium">
                            {isEditMode ? 'Update the details of this legislative period.' : 'Define a new legislative period to manage your roster.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 bg-slate-50/30">
                    
                    {/* Year Range Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_year" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Start Year
                            </Label>
                            <div className="relative">
                                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    id="start_year"
                                    type="number"
                                    min="1900"
                                    max="2100"
                                    className="pl-9 h-11 font-bold text-lg bg-white border-slate-200 focus-visible:ring-blue-500"
                                    value={formData.start_year}
                                    onChange={(e) => handleChange('start_year', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_year" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                End Year
                            </Label>
                            <div className="relative">
                                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    id="end_year"
                                    type="number"
                                    min="1900"
                                    max="2100"
                                    className="pl-9 h-11 font-bold text-lg bg-white border-slate-200 focus-visible:ring-blue-500"
                                    value={formData.end_year}
                                    onChange={(e) => handleChange('end_year', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Label Input */}
                    <div className="space-y-2">
                        <Label htmlFor="label" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            Label <span className="text-slate-300 font-normal normal-case">(Optional)</span>
                        </Label>
                        <Input
                            id="label"
                            placeholder="e.g. Current Administration"
                            className="h-11 bg-white border-slate-200 focus-visible:ring-blue-500 placeholder:text-slate-400"
                            value={formData.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>

                    {/* Active Toggle Card */}
                    <div className={`
                        flex items-center justify-between rounded-xl border p-4 transition-all duration-300
                        ${formData.is_active 
                            ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                            : 'bg-white border-slate-200'
                        }
                    `}>
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className={`text-sm font-bold ${formData.is_active ? 'text-blue-700' : 'text-slate-700'}`}>
                                Set as Current Term
                            </Label>
                            <p className="text-xs text-slate-500 font-medium">
                                Mark this period as the active administration.
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleChange('is_active', checked)}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-1 border border-red-100">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onClose}
                            className="h-11 text-slate-500 hover:text-slate-900 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="h-11 min-w-[140px] bg-slate-900 text-white hover:bg-orange-600 shadow-lg shadow-slate-900/20 transition-all active:scale-95 font-bold rounded-xl"
                        >
                            {isLoading ? (
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