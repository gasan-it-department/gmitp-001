import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    User, 
    Users, 
    Plus, 
    Pencil, 
    Trash2, 
    Upload, 
    GripVertical, 
    Save,
    UserPlus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OfficialsData, OfficialsPosition } from "@/Core/Types/LocalGovernment/OfficialsTypes";

const resizeImage = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 500; 
            canvas.height = 500;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                resolve(canvas.toDataURL("image/jpeg", 0.9));
            } else {
                resolve(url);
            }
        };
        img.onerror = () => resolve(url);
    });
};


const OfficialCard = ({ 
    official, 
    onEdit, 
    onDelete, 
    isDraggable = false,
    onDragStart,
    onDragEnter,
    onDragEnd,
    isDragging = false,
    className = ""
}: { 
    official: OfficialsData; 
    onEdit: (o: OfficialsData) => void; 
    onDelete: (id: string) => void;
    isDraggable?: boolean;
    onDragStart?: () => void;
    onDragEnter?: () => void;
    onDragEnd?: () => void;
    isDragging?: boolean;
    className?: string;
}) => {
    return (
        <Card 
            className={`
                relative flex items-center gap-4 p-4 transition-all duration-200 
                border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 
                shadow-sm hover:shadow-md z-10 w-full
                ${isDragging ? 'opacity-50 scale-[0.98] border-blue-400 border-dashed' : ''}
                ${className}
            `}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
        >
            {isDraggable && (
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mr-1">
                    <GripVertical className="w-5 h-5" />
                </div>
            )}
            
            {/* Avatar */}
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-100 dark:border-neutral-600 shadow-sm bg-gray-50">
                {official.image ? (
                    <img src={official.image} alt={official.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-neutral-700 text-gray-400">
                        <User className="h-7 w-7" />
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{official.name}</h4>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">{official.position}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(official)} className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(official.id)} className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
};

const EmptySlot = ({ position, onClick }: { position: string, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className="flex w-full items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
    >
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors">
            <UserPlus className="w-5 h-5" />
        </div>
        <div className="text-center">
            <span className="block text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-600">Add {position}</span>
        </div>
    </div>
);

export default function OfficialsPageEditor() {
    const [officialsList, setOfficialsList] = useState<OfficialsData[]>([]);
    const dragItemIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const mayor = officialsList.find(o => o.position === 'Mayor');
    const viceMayor = officialsList.find(o => o.position === 'Vice Mayor');
    const legislators = officialsList.filter(o => !['Mayor', 'Vice Mayor'].includes(o.position));

    const [addEditDialog, setAddEditDialog] = useState({
        isOpen: false,
    });

    const handleDragEnd = () => {
        const draggedIdx = dragItemIndex.current;
        const overIdx = dragOverIndex.current;

        if (draggedIdx !== null && overIdx !== null && draggedIdx !== overIdx) {
            const newLegislators = [...legislators];
            const [removed] = newLegislators.splice(draggedIdx, 1);
            newLegislators.splice(overIdx, 0, removed);
            
            // Reconstruct full array: Mayor -> VM -> Legislators
            const executives = officialsList.filter(o => ['Mayor', 'Vice Mayor'].includes(o.position));
            setOfficialsList([...executives, ...newLegislators]);
        }
        dragItemIndex.current = null;
        dragOverIndex.current = null;
    };

    const handleDelete = (id: string) => {

    }

    const handleOnSuccess = (data: OfficialsData) => {

    }

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-8">
            
            {/* Header */}
            <div className="mb-12 flex flex-col sm:flex-row justify-between items-end border-b border-gray-200 dark:border-neutral-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Organizational Chart</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage the hierarchy of elected officials.</p>
                </div>
            </div>

            {/* TREE STRUCTURE CONTAINER */}
            <div className="flex flex-col items-center w-full">
                
                {/* 1. MAYOR (Root) */}
                <div className="w-full max-w-md relative z-20 flex flex-col items-center">
                    <span className="mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-full">
                        Local Chief Executive
                    </span>
                    {mayor ? (
                        <OfficialCard official={mayor} onEdit={(editData) => { /* EDIT MODE */ }} onDelete={handleDelete} className="border-blue-200 dark:border-blue-900 shadow-lg" />
                    ) : (
                        <EmptySlot position="Mayor" onClick={() => { /* ADD MODE */ }} />
                    )}
                </div>

                {/* Connecting Line (Mayor to VM) */}
                <div className="w-px h-12 bg-gray-300 dark:bg-neutral-700"></div>

                {/* 2. VICE MAYOR (Branch) */}
                <div className="w-full max-w-md relative z-20 flex flex-col items-center">
                    <span className="mb-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider rounded-full">
                        Presiding Officer
                    </span>
                    {viceMayor ? (
                        <OfficialCard official={viceMayor} onEdit={(data) => {}} onDelete={handleDelete} className="border-orange-200 dark:border-orange-900 shadow-lg" />
                    ) : (
                        <EmptySlot position="Vice Mayor" onClick={() => {}} />
                    )}
                </div>

                {/* Connecting Line (VM to Council) */}
                <div className="w-px h-12 bg-gray-300 dark:bg-neutral-700"></div>

                {/* Horizontal Branch Line */}
                <div className="w-3/4 h-px bg-gray-300 dark:bg-neutral-700 mb-8 relative">
                    {/* Vertical ticks for aesthetic */}
                    <div className="absolute left-0 top-0 h-4 w-px bg-gray-300 dark:bg-neutral-700"></div>
                    <div className="absolute right-0 top-0 h-4 w-px bg-gray-300 dark:bg-neutral-700"></div>
                    <div className="absolute left-1/2 top-0 h-4 w-px bg-gray-300 dark:bg-neutral-700 -translate-x-1/2"></div>
                </div>

                {/* 3. LEGISLATIVE (Leaves/Grid) */}
                <div className="w-full">
                    <div className="text-center mb-8">
                        <span className="px-4 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-widest rounded-full border border-gray-200 dark:border-neutral-700">
                            Sangguniang Bayan Members
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {legislators.map((official, index) => (
                            <OfficialCard 
                                key={official.id} 
                                official={official} 
                                onEdit={(editData) => { /* EDIT MODE */}} 
                                onDelete={handleDelete}
                                isDraggable={true}
                                onDragStart={() => { dragItemIndex.current = index; }}
                                onDragEnter={() => { dragOverIndex.current = index; }}
                                onDragEnd={handleDragEnd}
                                className="hover:-translate-y-1"
                            />
                        ))}
                        
                        {/* Add Button as a Grid Item */}
                        <Button 
                            variant="outline" 
                            onClick={() => {/* ADD MODE */} }
                            className="h-auto min-h-[88px] flex flex-col gap-2 border-2 border-dashed border-gray-300 dark:border-neutral-700 text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 bg-transparent"
                        >
                            <Plus className="w-6 h-6" />
                            <span>Add Member</span>
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}