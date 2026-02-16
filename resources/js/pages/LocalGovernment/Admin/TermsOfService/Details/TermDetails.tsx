import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Building2, Calendar, CheckCircle2, History, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { AppointOfficialDialog } from './Components/AppointOfficialDialog';
import { RosterCard } from './Components/RosterCard';

// Assuming you have these dialogs or will create them next

interface Props {
    term: { data: Term };
    positions: Position[];
    municipality: MunicipalityType;
}

export default function TermDetails({ term, positions, municipality }: Props) {
    const termDetails = term.data;

    // --- STATE: The "Context" for our Modal ---
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [isAppointOpen, setIsAppointOpen] = useState(false);

    // --- LOGIC: Sort the Roster (The "Org Chart" Logic) ---
    // This assumes standard naming. Adjust filters if your DB titles are different.
    const mayor = positions.find((p) => p.title.includes('Mayor') && !p.title.includes('Vice'));
    const viceMayor = positions.find((p) => p.title.includes('Vice Mayor'));
    const councilors = positions.filter((p) => p.title.includes('Sangguniang') || p.title.includes('Councilor'));
    const exOfficios = positions.filter((p) => p.title.includes('ABC') || p.title.includes('SK'));

    // --- HELPER: Date Formatter ---
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleRosterCardClick = (pos: Position) => {
        console.log('Chef received order for:', pos.title);
    };
    return (
        <AppLayout>
            <div className="m-10 mx-auto max-w-7xl space-y-10 py-6">
                {/* --- 1. HEADER (Cleaned up) --- */}
                <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium tracking-wide text-gray-500 uppercase">
                            <Building2 className="mr-2 h-4 w-4" />
                            {municipality.name}
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{termDetails.name}</h1>
                            {termDetails.is_current ? (
                                <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Active Term
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                    <History className="mr-1 h-3 w-3" /> Past Term
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Note: I removed the "Appoint" button. The Grid is the button now. */}
                </div>
                {/* --- 2. DETAILS GRID (Dates & Stats) --- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Statutory Start</h3>
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDate(termDetails.statutory_start)}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Statutory End</h3>
                            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDate(termDetails.statutory_end)}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Total Seats</h3>
                            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                                <UserPlus className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
                    </div>
                </div>
                {/* --- 3. THE ROSTER GRID (The "Command Center") --- */}
                <div className="space-y-12 pb-20">
                    {/* SECTION A: EXECUTIVE (The Mayor) */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-sm font-semibold tracking-widest text-gray-500 uppercase">Executive Branch</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            {mayor && (
                                <RosterCard
                                    position={mayor}
                                    official={mayor?.official}
                                    onClick={(pos) => {
                                        setSelectedPosition(pos);
                                        setIsAppointOpen(true);
                                        handleRosterCardClick(pos);
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* SECTION B: LEGISLATIVE (Presiding Officer) */}
                    <div className="relative mt-10">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-sm font-semibold tracking-widest text-gray-500 uppercase">Legislative Branch</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        {/* Vice Mayor (Top of Legislative) */}
                        <div className="w-full max-w-md">
                            <div className="mb-2 text-center text-xs font-medium text-gray-400">Presiding Officer</div>
                            {viceMayor && (
                                <RosterCard
                                    position={viceMayor}
                                    official={viceMayor?.official}
                                    onClick={(pos) => {
                                        handleRosterCardClick(pos);
                                        setSelectedPosition(pos);
                                        setIsAppointOpen(true);
                                    }}
                                />
                            )}
                        </div>

                        {/* Councilors Grid */}
                        <div className="w-full">
                            <div className="mb-4 text-center text-xs font-medium text-gray-400">Sangguniang Bayan Members</div>
                            {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                                {councilors.map((pos) => (
                                    // <RosterCard key={pos.id} position={pos} />
                                    <div></div>
                                ))}
                            </div> */}
                        </div>

                        {/* Ex-Officios */}
                        {exOfficios.length > 0 && (
                            <div className="w-full border-t border-dashed pt-6">
                                <div className="mb-4 text-center text-xs font-medium text-gray-400">Ex-Officio Members</div>
                                {/* <div className="flex flex-wrap justify-center gap-6">
                                    {exOfficios.map((pos) => (
                                        <div key={pos.id} className="w-full sm:w-64">
                                            <RosterCard key={pos.id} position={pos} />
                                        </div>
                                    ))}
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>
                {/* --- 4. THE MODAL LOGIC (Hidden) --- */}
                {/* When this logic is ready, it will look like this: */}
                {/* <AppointOfficialDialog 
                    isOpen={isAppointOpen}
                    onClose={() => setIsAppointOpen(false)}
                    position={selectedPosition} // It knows we clicked "Mayor"
                    term={termDetails}
                /> 
                */}
                <AppointOfficialDialog
                    isOpen={isAppointOpen}
                    onClose={() => {
                        setIsAppointOpen(false);
                        setSelectedPosition(null);
                    }}
                    position={selectedPosition}
                />
            </div>
        </AppLayout>
    );
}
