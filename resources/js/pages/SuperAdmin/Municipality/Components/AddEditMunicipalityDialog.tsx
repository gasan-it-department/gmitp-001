import { MunicipalitySelect } from '@/components/Shared/MunicipalitySelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import municipality from '@/routes/municipality';
import { useForm } from '@inertiajs/react';

interface AddEditMunicipalityProps {
    isOpen: boolean;
    editData?: MunicipalityType | null;
    onClose: () => void;
    provinceId?: string;
}

export default function AddEditMunicipalityDialog({ isOpen, onClose, editData, provinceId }: AddEditMunicipalityProps) {
    const activeProvinceId = provinceId || '28';

    // 2. Pass the interface to useForm and guarantee fallback strings using '??'
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        zip_code: editData?.zip_code ?? '',
        // The '??' here is the magic fix. It prevents 'undefined' from ever entering the state.
        psgc_municipal_id: editData?.psgc_municipal_id ?? '',
        is_active: editData ? !!editData.is_active : true,
    });

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editData) {
            put(municipality.superAdmin.update.url(editData.id), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        } else {
            post(municipality.superAdmin.add.url(), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        }
    };

    // Uniqueness errors from UpdateMunicipalityController are flashed under "municipality".
    const generalError = (errors as Record<string, string>).municipality;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-md">
                <DialogHeader className="border-b border-orange-100 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">{editData ? 'Edit Municipality' : 'Add Municipality'}</DialogTitle>
                    <p className="text-sm text-gray-500">Establish geographic borders for this tenant.</p>
                </DialogHeader>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto px-1 pr-2">
                    <form key={editData?.id ?? 'new-form'} onSubmit={handleSubmit} className="mt-4 space-y-6">
                        {generalError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</div>
                        )}

                        {/* --- Municipality Select --- */}
                        <div className="space-y-1">
                            <Label className="text-sm font-semibold text-gray-700">
                                Municipality Name & Code <span className="text-red-500">*</span>
                            </Label>

                            {editData ? (
                                <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-medium text-gray-600">
                                    {editData.name}
                                </div>
                            ) : (
                                <MunicipalitySelect
                                    provinceId={activeProvinceId}
                                    // Because of the '??' in useForm, data.psgc_municipal_id is now guaranteed to be a string
                                    value={data.psgc_municipal_id}
                                    onChange={(value) => {
                                        const safeValue = value || '';
                                        setData('psgc_municipal_id', safeValue);
                                        if (safeValue) clearErrors('psgc_municipal_id');
                                    }}
                                />
                            )}
                            {errors.psgc_municipal_id && <p className="mt-1 text-xs text-red-600">{errors.psgc_municipal_id}</p>}
                        </div>

                        {/* --- Zip Code --- */}
                        <div className="space-y-1">
                            <Label htmlFor="zip_code" className="text-sm font-semibold text-gray-700">
                                Zip Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="zip_code"
                                placeholder="e.g., 4905"
                                value={data.zip_code}
                                onChange={(e) => setData('zip_code', e.target.value)}
                                className={`bg-white font-medium text-gray-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                    errors.zip_code ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.zip_code && <p className="mt-1 text-xs text-red-600">{errors.zip_code}</p>}
                        </div>

                        {/* --- Active Toggle --- */}
                        <div className="flex items-center justify-between border-t border-orange-100 pt-4">
                            <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                                Active Tenant
                            </Label>
                            <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                        </div>

                        {/* --- Footer Buttons --- */}
                        <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 sm:flex-none">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-50 sm:flex-none"
                            >
                                {processing ? (editData ? 'Updating...' : 'Saving...') : editData ? 'Update' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
