import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";

export interface Hotline {
    id: string;
    name: string;
    number: string;
}

interface HotlineEditorProps {
    hotlines: Hotline[];
    setHotlines: React.Dispatch<React.SetStateAction<Hotline[]>>;
}

export default function HotlineEditor({ hotlines, setHotlines }: HotlineEditorProps) {
    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<Hotline>();
    const [isEditingId, setIsEditingId] = useState<string | null>(null);

    const onSubmit = (data: Hotline) => {
        if (isEditingId) {
            // EDIT API CALL HERE.
            // CALL response.success
            // if (response.success) {
            //     setHotlines(prev => prev.map(h => h.id === isEditingId ? { ...data, id: isEditingId } : h));
            //     setIsEditingId(null);
            // }
            setHotlines(prev => prev.map(h => h.id === isEditingId ? { ...data, id: isEditingId } : h));
            setIsEditingId(null);
        } else {
            // ADD API CALL HERE.
            // CALL response.success
            // if (response.success) {
            //     setHotlines(prev => [...prev, { ...data, id: Date.now().toString() }]);
            // }
            setHotlines(prev => [...prev, { ...data, id: Date.now().toString() }]);
        }

        reset({ name: '', number: '' });
    };

    const handleEdit = (hotline: Hotline) => {
        setIsEditingId(hotline.id);
        setValue("name", hotline.name);
        setValue("number", hotline.number);
    };

    const handleDelete = (id: string) => {
        // DELETE API CALL HERE.
        // IF THE API DELETE IS SUCCESS THEN EXECUTE BELOW CODE
        // if(response.success){
        //     // UPDATE THE UI
        //     setHotlines(prev => prev.filter(h => h.id !== id));
        // }

        setHotlines(prev => prev.filter(h => h.id !== id));
    };

    // const moveHotline = (index: number, direction: 'up' | 'down') => {
    //     const newHotlines = [...hotlines];
    //     const targetIndex = direction === 'up' ? index - 1 : index + 1;
    //     if (targetIndex >= 0 && targetIndex < newHotlines.length) {
    //         [newHotlines[index], newHotlines[targetIndex]] = [newHotlines[targetIndex], newHotlines[index]];
    //         setHotlines(newHotlines);
    //     }
    // };

    return (
        <div className="space-y-6">
            {/* Form to Add/Edit Hotline */}
            <Card className="p-6 shadow-md dark:bg-neutral-800">
                <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                    {isEditingId ? "Edit Hotline" : "Add New Hotline"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                            <input
                                {...register("name", { required: true })}
                                className="w-full p-2 border rounded-lg mt-1 dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
                                placeholder="e.g. MDRRMO"
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number(s)</label>
                            <textarea
                                {...register("number", { required: true })}
                                className="w-full p-2 border rounded-lg mt-1 dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 min-h-[80px]"
                                placeholder="e.g. 911"
                            />
                            {errors.number && <p className="text-xs text-red-500 mt-1">Number is required</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        {isEditingId && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setIsEditingId(null); reset({ name: '', number: '' }); }}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            {isEditingId ? "Save Changes" : "Add Hotline"}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Hotline List */}
            <div className="space-y-3">
                {hotlines.map((hotline, index) => (
                    <Card key={hotline.id} className="p-4 flex justify-between items-center dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900/30">
                                <Phone className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{hotline.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{hotline.number}</div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {/* <Button variant="ghost" size="icon" onClick={() => moveHotline(index, 'up')} disabled={index === 0}>
                                <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => moveHotline(index, 'down')} disabled={index === hotlines.length - 1}>
                                <ChevronUp className="w-4 h-4 rotate-180" />
                            </Button> */}
                            <Button variant="outline" size="sm" onClick={() => handleEdit(hotline)}>Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(hotline.id)} className="text-white">Delete</Button>
                        </div>
                    </Card>
                ))}
                {hotlines.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl">
                        <p>No hotlines added yet.</p>
                        <p className="text-sm mt-1">Use the form above to add emergency contacts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}