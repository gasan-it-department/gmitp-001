import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import government from '@/routes/government';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, CalendarRange, CheckCircle2, ChevronRight, History, MoreVertical, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateTermDialog from '../Create/CreateTermDialog';

// --- TYPES ---
interface TermResource {
    id: string;
    name: string;
    statutory_start: string; // "2026-06-30"
    statutory_end: string; // "2029-06-30"
    label: string;
    is_active?: boolean;
    officials_count?: number;
}

interface PageProps {
    sample: {
        data: TermResource[];
    };
    [key: string]: any;
}

export default function YearTermsList() {
    const { sample } = usePage<PageProps>().props;
    const { currentMunicipality } = useMunicipality();
    const processData = (data: TermResource[]) => {
        const sorted = [...data].sort((a, b) => b.statutory_start.localeCompare(a.statutory_start));

        return sorted.map((term) => ({
            ...term,
            is_active: term.label.toLowerCase().includes('(current)'),
            officials_count: 0,
        }));
    };

    const [terms, setTerms] = useState<TermResource[]>(() => processData(sample.data));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [termToEdit, setTermToEdit] = useState<TermResource | null>(null);
    const [termToDelete, setTermToDelete] = useState<string | null>(null);

    useEffect(() => {
        setTerms(processData(sample.data));
    }, [sample.data]);

    useEffect(() => {
        if (!termToDelete && !isDialogOpen) {
            const timer = setTimeout(() => {
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [termToDelete, isDialogOpen]);

    const handleEdit = (id: string) => {
        const term = terms.find((t) => t.id === id);
        if (term) {
            setTermToEdit(term);
            setIsDialogOpen(true);
        }
    };

    const handleCreateClick = () => {
        setTermToEdit(null);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setTermToDelete(id);
    };

    const confirmDelete = () => {
        // API call to delete would go here
        if (termToDelete) {
            setTerms((prev) => prev.filter((term) => term.id !== termToDelete));
            setTermToDelete(null);
        }
    };

    const handleManage = (id: string) => console.log('Manage Officials', id);
    const getYear = (dateStr: string) => dateStr.split('-')[0];

    return (
        <div className="relative min-h-screen w-full bg-slate-50/30">
            {/* CHANGED: Removed max-w-4xl and mx-auto, added w-full */}
            <div className="relative w-full p-6 md:p-10">
                {/* --- HEADER --- */}
                <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded-lg border border-orange-200 bg-orange-100 p-1.5 text-orange-600 shadow-sm">
                                <History className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black tracking-widest text-orange-700 uppercase">Records</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            Term <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">History</span>
                        </h1>
                        <p className="mt-2 max-w-md text-sm font-medium text-slate-500 sm:text-base">
                            Create and manage legislative periods to organize your official rosters.
                        </p>
                    </div>

                    <button
                        onClick={handleCreateClick}
                        className="group flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-orange-600 hover:shadow-orange-600/30 active:scale-95"
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
                            <div className="mb-4 rounded-full bg-slate-100 p-5 shadow-inner">
                                <CalendarRange className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No terms found</h3>
                            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                                Get started by creating the first term year range for your municipality.
                            </p>
                            <button
                                onClick={handleCreateClick}
                                className="mt-6 text-sm font-bold text-orange-600 underline-offset-4 hover:text-orange-700 hover:underline"
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
                                className={`group relative flex cursor-pointer flex-col items-center gap-5 rounded-2xl border p-1 pr-3 transition-all duration-300 sm:flex-row ${
                                    term.is_active
                                        ? 'border-blue-200 bg-gradient-to-br from-white to-blue-50/50 shadow-lg ring-1 shadow-blue-500/5 ring-blue-500/10'
                                        : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5'
                                } `}
                            >
                                {/* Left Visual */}
                                <div
                                    className={`my-2 ml-2 hidden h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border sm:flex ${
                                        term.is_active
                                            ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                                            : 'border-slate-100 bg-slate-50 text-slate-400 transition-colors group-hover:border-orange-100 group-hover:bg-white group-hover:text-orange-500'
                                    } `}
                                >
                                    <CalendarClock className="mb-1 h-7 w-7" />
                                </div>

                                {/* Content Details */}
                                <div className="w-full flex-1 p-4 sm:p-0">
                                    <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {term.is_active && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black tracking-wide text-blue-700 uppercase">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Current Term
                                                </span>
                                            )}
                                            {term.label && (
                                                <span className="text-xs font-bold tracking-wide text-slate-400 uppercase">{term.label}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h3
                                                className={`text-2xl leading-none font-black tracking-tight sm:text-3xl ${term.is_active ? 'text-slate-900' : 'text-slate-700'}`}
                                            >
                                                {getYear(term.statutory_start)}
                                                <span className="mx-1 font-light text-slate-300">/</span>
                                                {getYear(term.statutory_end)}
                                            </h3>
                                            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors group-hover:text-slate-700">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{term.officials_count || 0} Officials</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex w-full items-center justify-between gap-2 border-t border-slate-100 px-4 pt-3 pb-4 sm:w-auto sm:justify-end sm:border-0 sm:px-0 sm:pt-0 sm:pb-0">
                                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase sm:hidden">Actions</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={government.admin.officials.termspage.url({
                                                municipality: currentMunicipality.slug,
                                                termId: term.id,
                                            })}
                                            className={`hidden h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-1 sm:flex ${term.is_active ? 'bg-blue-50 text-blue-500' : 'text-slate-300 group-hover:text-orange-500'} `}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 border-slate-100 shadow-xl">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(term.id)}
                                                        className="cursor-pointer py-2.5 font-medium"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 text-slate-400" />
                                                        Edit Details
                                                    </DropdownMenuItem>
                                                    <div className="my-1 h-px bg-slate-50" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(term.id)}
                                                        className="cursor-pointer py-2.5 font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
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
                initialData={
                    termToEdit
                        ? {
                              id: termToEdit.id,
                              statutoryStart: termToEdit.statutory_start,
                              statutoryEnd: termToEdit.statutory_end,
                              name: termToEdit.name,
                              isCurrent: termToEdit.is_active,
                          }
                        : null
                }
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
