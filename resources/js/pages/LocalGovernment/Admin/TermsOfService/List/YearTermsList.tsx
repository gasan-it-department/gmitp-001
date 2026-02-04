import { useState, useEffect } from 'react';
import { 
    CalendarRange, 
    Plus, 
    MoreVertical, 
    Pencil, 
    Trash2, 
    ChevronRight, 
    CalendarClock, 
    History,
    CheckCircle2,
    Users
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import CreateTermDialog, { TermFormData } from '../Create/CreateTermDialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';

// --- TYPES ---
interface YearTerm {
    id: string;
    start_year: string;
    end_year: string;
    label?: string; 
    is_active: boolean; 
    officials_count: number;
}

// --- MOCK DATA ---
const MOCK_TERMS: YearTerm[] = [
    { id: '1', start_year: '2025', end_year: '2028', label: 'Current Administration', is_active: true, officials_count: 12 },
    { id: '2', start_year: '2022', end_year: '2025', is_active: false, officials_count: 12 },
    { id: '3', start_year: '2019', end_year: '2022', is_active: false, officials_count: 11 },
    { id: '4', start_year: '2016', end_year: '2019', is_active: false, officials_count: 10 },
];

export default function YearTermsList() {
    const [terms, setTerms] = useState<YearTerm[]>(MOCK_TERMS);
    
    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [termToEdit, setTermToEdit] = useState<YearTerm | null>(null);
    const [termToDelete, setTermToDelete] = useState<string | null>(null);

    // Fix sticky pointer-events
    useEffect(() => {
        if (!termToDelete && !isDialogOpen) {
            const timer = setTimeout(() => {
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [termToDelete, isDialogOpen]);

    // --- HANDLERS ---

    const handleEdit = (id: string) => {
        const term = terms.find(t => t.id === id);
        if (term) {
            setTermToEdit(term);
            setIsDialogOpen(true);
        }
    };

    const handleCreateClick = () => {
        setTermToEdit(null); // Ensure no edit data is present for create mode
        setIsDialogOpen(true);
    }

    const handleDeleteClick = (id: string) => {
        setTermToDelete(id); 
    };

    const confirmDelete = () => {
        if (termToDelete) {
            setTerms(prev => prev.filter(term => term.id !== termToDelete));
            setTermToDelete(null); 
        }
    };

    const handleManage = (id: string) => console.log('Manage Officials', id);

    // --- SAVE LOGIC (CREATE OR UPDATE) ---
    const handleSaveTerm = async (data: TermFormData) => {
        
        // 1. Fake API Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Logic Separation
        if (termToEdit) {
            // ================== UPDATE API CALL PLACEHOLDER ==================

            console.log("Updating existing term...", termToEdit.id, data);
            setTerms(prev => {
                let updatedList = [...prev];
                if (data.is_active) {
                    updatedList = updatedList.map(t => ({ ...t, is_active: false }));
                }

                return updatedList.map(t => t.id === termToEdit.id ? {
                    ...t,
                    start_year: data.start_year,
                    end_year: data.end_year,
                    label: data.label || undefined,
                    is_active: data.is_active
                } : t);
            });

        } else {
            // ================== CREATE API CALL PLACEHOLDER ==================
            
            console.log("Creating new term...", data);
            const newTerm: YearTerm = {
                id: Date.now().toString(),
                start_year: data.start_year,
                end_year: data.end_year,
                label: data.label || undefined,
                is_active: data.is_active,
                officials_count: 0 
            };

            setTerms(prev => {
                let updatedList = [...prev];
                
                // Deactivate others if this is set to active
                if (newTerm.is_active) {
                    updatedList = updatedList.map(t => ({ ...t, is_active: false }));
                }
                
                updatedList.unshift(newTerm);
                return updatedList;
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 relative">
            <div className="relative mx-auto max-w-4xl p-8">
                
                {/* --- HEADER --- */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center rounded-lg bg-orange-100 p-1.5 text-orange-600 shadow-sm border border-orange-200">
                                <History className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                                Records
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Term <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">History</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-md text-sm sm:text-base">
                            Create and manage legislative periods to organize your official rosters.
                        </p>
                    </div>

                    <button 
                        onClick={handleCreateClick}
                        className="group flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-orange-600 hover:shadow-orange-600/30 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                        New Term
                    </button>
                </div>

                {/* --- LIST CONTAINER --- */}
                <div className="space-y-4">
                    
                    {terms.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 py-24 text-center">
                            <div className="rounded-full bg-slate-100 p-5 mb-4 shadow-inner">
                                <CalendarRange className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No terms found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                                Get started by creating the first term year range for your municipality.
                            </p>
                            <button 
                                onClick={handleCreateClick}
                                className="mt-6 text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline underline-offset-4"
                            >
                                Create a Term
                            </button>
                        </div>
                    ) : (
                        /* Terms List */
                        terms.map((term) => (
                            <div 
                                key={term.id}
                                onClick={() => handleManage(term.id)}
                                className={`
                                    group relative flex flex-col sm:flex-row items-center gap-5 rounded-2xl border p-1 pr-3 transition-all duration-300 cursor-pointer
                                    ${term.is_active 
                                        ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' 
                                        : 'bg-white border-slate-200 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5'
                                    }
                                `}
                            >
                                {/* Left Visual */}
                                <div className={`
                                    hidden sm:flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border ml-2 my-2
                                    ${term.is_active 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                                        : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white group-hover:border-orange-100 group-hover:text-orange-500 transition-colors'
                                    }
                                `}>
                                    <CalendarClock className="h-7 w-7 mb-1" />
                                </div>

                                {/* Content Details */}
                                <div className="flex-1 w-full p-4 sm:p-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {term.is_active && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Current Term
                                                </span>
                                            )}
                                            {term.label && (
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                    {term.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${term.is_active ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {term.start_year}<span className="text-slate-300 mx-1 font-light">/</span>{term.end_year}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{term.officials_count} Officials</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end px-4 sm:px-0 pb-4 sm:pb-0 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                                    <span className="text-xs font-bold text-slate-400 sm:hidden uppercase tracking-wider">Actions</span>
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className={`
                                                hidden sm:flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-1
                                                ${term.is_active ? 'text-blue-500 bg-blue-50' : 'text-slate-300 group-hover:text-orange-500'}
                                            `}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 shadow-xl border-slate-100">
                                                    <DropdownMenuItem onClick={() => handleEdit(term.id)} className="cursor-pointer font-medium py-2.5">
                                                        <Pencil className="mr-2 h-4 w-4 text-slate-400" />
                                                        Edit Details
                                                    </DropdownMenuItem>
                                                    <div className="my-1 h-px bg-slate-50" />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDeleteClick(term.id)} 
                                                        className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50 py-2.5"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Term
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- CREATE / EDIT DIALOG --- */}
            <CreateTermDialog 
                isOpen={isDialogOpen} 
                onClose={() => {
                    setIsDialogOpen(false);
                    setTermToEdit(null);
                }}
                onSubmit={handleSaveTerm} 
                initialData={termToEdit ? {
                    start_year: termToEdit.start_year,
                    end_year: termToEdit.end_year,
                    label: termToEdit.label || '',
                    is_active: termToEdit.is_active
                } : null}
            />

            {/* --- DELETE CONFIRMATION DIALOG --- */}
            <ClassicDialog 
                open={!!termToDelete}
                title="Delete Term"
                message="Are you sure you want to delete this term? All associated official records will be permanently removed."
                positiveButtonText="Delete"
                negativeButtonText="Cancel"
                onPositiveClick={confirmDelete}
                onNegativeClick={() => setTermToDelete(null)}
            />
        </div>
    );
}