import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    User, Pencil, Trash2, GripVertical, Check, Plus,
    Shield, Star, Camera, Crown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import LoadingDialog from "@/pages/Utility/LoadingDialog";
import { OfficialsData, OfficialsPosition } from "@/Core/Types/LocalGovernment/OfficialsTypes";
import ClassicDialog from "@/pages/Utility/ClassicDialog";

// --- UTILITY: IMAGE RESIZING ---
const resizeImage = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 500; canvas.height = 500;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                resolve(canvas.toDataURL("image/jpeg", 0.9));
            } else resolve(url);
        };
        img.onerror = () => resolve(url);
    });
};

// --- COMPONENT: OFFICIAL CARD ---
const OfficialCard = ({
    official, onUpdate, onDelete, isDraggable, onDragStart, onDragEnter, onDragEnd, variant = "standard"
}: {
    official: OfficialsData;
    onUpdate: (id: string, data: Partial<OfficialsData>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isDraggable?: boolean; onDragStart?: () => void; onDragEnter?: () => void; onDragEnd?: () => void;
    variant?: "executive" | "standard"
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(official.name === "");
    const [tempName, setTempName] = useState<string>(official.name);
    const [tempImg, setTempImg] = useState<string | null>(official.image);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTitle, setLoadingTitle] = useState("Processing...");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setLoadingTitle("Saving Changes...");
        setIsLoading(true);

        const payload = {
            name: tempName,
            image: tempImg,
            position: official.position
        };

        await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition
        await onUpdate(official.id, payload);

        setIsLoading(false);
        setIsEditing(false);
    };

    const handleDeleteClick = async () => {
        if (!window.confirm(`Are you sure you want to remove ${official.name || "this official"}?`)) return;
        setLoadingTitle("Deleting Official...");
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        await onDelete(official.id);
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setTempName(official.name);
            setIsEditing(false);
        }
    };

    // Styling based on variant
    const isExec = variant === "executive";
    const imgSize = isExec ? "h-24 w-24" : "h-16 w-16";
    const activeBorder = isExec ? "border-amber-400 ring-4 ring-amber-400/10" : "border-blue-500 ring-4 ring-blue-500/10";

    return (
        <>
            <LoadingDialog isOpen={isLoading} title={loadingTitle} />

            <Card
                className={`
                    group relative flex items-center gap-5 p-4 transition-all duration-300
                    bg-white shadow-sm border
                    ${isEditing ? `scale-[1.02] shadow-xl z-20 ${activeBorder}` : 'hover:border-slate-300 hover:shadow-md'}
                    ${isExec ? 'bg-gradient-to-br from-white to-amber-50/30' : ''}
                `}
            >
                {/* Drag Handle */}
                {isDraggable && !isEditing && (
                    <div
                        className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                        draggable onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd}
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}

                {/* Image Section */}
                <div className={`relative flex-shrink-0 ${imgSize} ${isDraggable ? 'ml-3' : ''}`}>
                    <div className={`h-full w-full overflow-hidden rounded-2xl border bg-slate-50 shadow-inner ${isExec ? 'border-amber-100' : 'border-slate-100'}`}>
                        {tempImg ? (
                            <img src={tempImg} className="h-full w-full object-cover" alt={official.name} />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-200">
                                <User className={isExec ? "w-10 h-10" : "w-8 h-8"} />
                            </div>
                        )}
                    </div>

                    {/* Upload Overlay */}
                    {isEditing && (
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl text-white backdrop-blur-[1px] cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200 group-hover:opacity-100"
                        >
                            <Camera className="w-5 h-5 mb-1" />
                            <span className="text-[8px] font-bold uppercase tracking-wider">Change</span>
                        </div>
                    )}
                    <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                const resized = await resizeImage(reader.result as string);
                                setTempImg(resized);
                            };
                            reader.readAsDataURL(file);
                        }
                    }} />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {isEditing ? (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="relative">
                                <Input
                                    autoFocus
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter Full Name"
                                    className={`h-9 font-bold text-lg border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-slate-300 ${isExec ? 'border-amber-300 focus:border-amber-500' : 'border-blue-200 focus:border-blue-500'}`}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isExec ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {official.position}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Press Enter to Save</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => setIsEditing(true)}>
                            <div className="flex items-center gap-2">
                                {isExec && (
                                    <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isExec ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {official.position}
                                </span>
                            </div>
                            <h4 className={`font-bold text-slate-800 leading-tight truncate ${isExec ? 'text-2xl' : 'text-lg'}`}>
                                {official.name || <span className="text-slate-300 italic font-normal">Click to add name...</span>}
                            </h4>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 items-center justify-center border-l pl-3 ml-2 border-slate-100">
                    {isEditing ? (
                        <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-full">
                            <Check className="w-5 h-5" />
                        </Button>
                    ) : (
                        <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity duration-200">
                            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleDeleteClick} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
};

// --- MAIN PAGE EDITOR ---
export default function OfficialsPageEditor() {
    const [officials, setOfficials] = useState<OfficialsData[]>([]);
    const dragIdx = useRef<number | null>(null);
    const overIdx = useRef<number | null>(null);

    const mayor = officials.find((o) => o.position === 'Mayor');
    const viceMayor = officials.find((o) => o.position === 'Vice Mayor');
    const legislators = officials.filter((o) => !['Mayor', 'Vice Mayor'].includes(o.position));

    const handleAdd = (pos: OfficialsPosition) => {
        const newOff: OfficialsData = { id: crypto.randomUUID(), name: '', position: pos, image: null };
        setOfficials((prev) => [...prev, newOff]);
    };

    const updateOfficial = async (id: string, data: Partial<OfficialsData>) => {
        setOfficials((prev) => prev.map((o) => o.id === id ? { ...o, ...data } : o));
    };

    const deleteOfficial = async (id: string) => {
        setOfficials((prev) => prev.filter((o) => o.id !== id));
    };

    const handleSort = () => {
        if (dragIdx.current === null || overIdx.current === null) return;
        const list = [...legislators];
        const [moved] = list.splice(dragIdx.current, 1);
        list.splice(overIdx.current, 0, moved);
        const nonLegislators = officials.filter((o) => ['Mayor', 'Vice Mayor'].includes(o.position));
        setOfficials([...nonLegislators, ...list]);
        dragIdx.current = null;
        overIdx.current = null;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative max-w-6xl mx-auto p-8 lg:p-12">

                {/* Header Removed as requested */}

                <div className="flex flex-col items-center gap-12 mt-8">

                    {/* EXECUTIVE BRANCH */}
                    <div className="w-full max-w-3xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                Executive Department
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mayor ? (
                                <OfficialCard official={mayor} onUpdate={updateOfficial} onDelete={deleteOfficial} variant="executive" />
                            ) : (
                                <EmptySlot label="Add City Mayor" icon={Shield} onClick={() => handleAdd('Mayor')} variant="executive" />
                            )}

                            {viceMayor ? (
                                <OfficialCard official={viceMayor} onUpdate={updateOfficial} onDelete={deleteOfficial} variant="executive" />
                            ) : (
                                <EmptySlot label="Add Vice Mayor" icon={Star} onClick={() => handleAdd('Vice Mayor')} variant="executive" />
                            )}
                        </div>
                    </div>

                    {/* LEGISLATIVE BRANCH */}
                    <div className="w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-200"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Legislative Department
                            </span>
                            <div className="h-px flex-1 bg-slate-200"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {legislators.map((off, idx) => (
                                <OfficialCard
                                    key={off.id}
                                    official={off}
                                    isDraggable
                                    onDragStart={() => { dragIdx.current = idx; }}
                                    onDragEnter={() => { overIdx.current = idx; }}
                                    onDragEnd={handleSort}
                                    onUpdate={updateOfficial}
                                    onDelete={deleteOfficial}
                                />
                            ))}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="group relative h-24 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-600">
                                        <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wide">Add Member</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => handleAdd('Councilor')} className="cursor-pointer font-medium">
                                        <User className="w-4 h-4 mr-2 text-slate-400" /> Councilor
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAdd('ABC President')} className="cursor-pointer font-medium">
                                        <Shield className="w-4 h-4 mr-2 text-slate-400" /> ABC President
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAdd('SK Federation President')} className="cursor-pointer font-medium">
                                        <Star className="w-4 h-4 mr-2 text-slate-400" /> SK Fed. President
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            <ClassicDialog
                title={""}
                message={""}
                open={false} />
        </div>
    );
}

// --- SUB-COMPONENT: EMPTY SLOT ---
const EmptySlot = ({ label, icon: Icon, onClick, variant }: { label: string, icon: any, onClick: () => void, variant?: 'executive' }) => (
    <button
        onClick={onClick}
        className={`
            group relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3
            ${variant === 'executive'
                ? 'h-32 border-amber-200 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-300 text-amber-400 hover:text-amber-600'
                : 'h-24 border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 text-slate-400 hover:text-blue-600'}
        `}
    >
        <div className={`
            p-3 rounded-full shadow-sm border transition-transform group-hover:scale-110
            ${variant === 'executive' ? 'bg-amber-100 border-amber-200' : 'bg-white border-slate-100'}
        `}>
            <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
);