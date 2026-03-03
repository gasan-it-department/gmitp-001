import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Building2, Calendar, CheckCircle2, History, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { AppointOfficialDialog } from './Components/AppointOfficialDialog';
import { ManageAppointmentDialog } from './Components/ManageAppointmentDialog';
import PublishControl from './Components/PublishControl';
import { RosterCard } from './Components/RosterCard';

interface Props {
    term: { data: Term };
    positions: { data: Position[] };
    municipality: MunicipalityType;
    appointment: { data: OfficialTerm[] };
}

export default function TermDetails({ term, positions, municipality, appointment }: Props) {
    const termDetails = term.data;
    const positionsData = positions.data;
    const roster = appointment.data;

    // --- STATE ---
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [isAppointOpen, setIsAppointOpen] = useState(false);
    const [isManageOpen, setIsManageOpen] = useState(false);

    // --- LOGIC: Sort the Roster ---
    const mayor = positionsData.find((p) => p.title.includes('Mayor') && !p.title.includes('Vice'));
    const viceMayor = positionsData.find((p) => p.title.includes('Vice Mayor'));
    const councilors = positionsData.filter((p) => p.title.includes('Sangguniang') || p.title.includes('Councilor'));
    const exOfficios = positionsData.filter((p) => p.title.includes('ABC') || p.title.includes('SK'));

    const getOrdinalRank = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getActiveAppointment = (positionId: string) => {
        return roster.find((appt) => appt.position?.id === positionId && appt.actual_end_date === null);
    };

    const getHistoryForPosition = (positionId: string) => {
        return roster
            .filter((appt) => appt.position?.id === positionId && appt.actual_end_date !== null)
            .sort((a, b) => {
                const dateA = new Date(a.actual_end_date!).getTime();
                const dateB = new Date(b.actual_end_date!).getTime();
                return dateB - dateA;
            });
    };

    const handleCardClick = (pos: Position) => {
        setSelectedPosition(pos);
        const isOccupied = getActiveAppointment(pos.id);
        if (isOccupied) {
            setIsManageOpen(true);
            setIsAppointOpen(false);
        } else {
            setIsAppointOpen(true);
            setIsManageOpen(false);
        }
    };

    return (
        <AppLayout>
            <div className="m-10 mx-auto max-w-7xl space-y-10 py-6">
                {/* --- 1. HEADER (Command Center) --- */}
                <div className="flex flex-col items-start justify-between gap-6 border-b pb-8 md:flex-row md:items-end">
                    {/* Left: Identity & Status */}
                    <div className="space-y-3">
                        <div className="flex items-center text-xs font-black tracking-widest text-slate-400 uppercase">
                            <Building2 className="mr-2 h-4 w-4 text-slate-300" />
                            {municipality.name}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{termDetails.name}</h1>

                            <div className="flex items-center gap-2">
                                {termDetails.is_current ? (
                                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Active Term
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                                        <History className="mr-1.5 h-3.5 w-3.5" /> Past Term
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Publish Control */}
                    <PublishControl term={termDetails} />
                </div>

                {/* --- 2. DETAILS GRID --- */}
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
                        <p className="text-2xl font-bold text-gray-900">{positionsData.length}</p>
                    </div>
                </div>

                {/* --- 3. THE ROSTER GRID --- */}
                <div className="space-y-12 pb-20">
                    {/* SECTION A: EXECUTIVE */}
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
                                    official={getActiveAppointment(mayor.id)?.official}
                                    onClick={() => handleCardClick(mayor)}
                                />
                            )}
                        </div>
                    </div>

                    {/* SECTION B: LEGISLATIVE */}
                    <div className="relative mt-10">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-sm font-semibold tracking-widest text-gray-500 uppercase">Legislative Branch</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        {/* Presiding Officer */}
                        <div className="w-full max-w-md">
                            <div className="mb-2 text-center text-xs font-medium text-gray-400">Presiding Officer</div>
                            {viceMayor && (
                                <RosterCard
                                    position={viceMayor}
                                    official={getActiveAppointment(viceMayor.id)?.official}
                                    onClick={() => handleCardClick(viceMayor)}
                                />
                            )}
                        </div>

                        {/* Councilors Grid */}
                        <div className="w-full">
                            <div className="mb-6 text-center text-xs font-bold tracking-widest text-gray-400 uppercase">
                                Sangguniang Bayan Members (Councilors)
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {councilors.map((pos, index) => (
                                    <div key={pos.id} className="relative mt-3">
                                        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-800 px-3 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm ring-4 ring-white">
                                            {getOrdinalRank(index + 1)} Rank
                                        </div>
                                        <RosterCard
                                            position={pos}
                                            official={getActiveAppointment(pos.id)?.official}
                                            onClick={() => handleCardClick(pos)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ex-Officios */}
                        {exOfficios.length > 0 && (
                            <div className="w-full border-t border-dashed pt-6">
                                <div className="mb-4 text-center text-xs font-medium text-gray-400">Ex-Officio Members</div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    {exOfficios.map((pos) => (
                                        <div key={pos.id} className="w-full sm:w-64">
                                            <RosterCard
                                                position={pos}
                                                official={getActiveAppointment(pos.id)?.official}
                                                onClick={() => handleCardClick(pos)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 4. MODALS --- */}
                <AppointOfficialDialog
                    term={termDetails}
                    isOpen={isAppointOpen}
                    onClose={() => {
                        setIsAppointOpen(false);
                        setSelectedPosition(null);
                    }}
                    position={selectedPosition}
                />
                {selectedPosition && getActiveAppointment(selectedPosition.id) && (
                    <ManageAppointmentDialog
                        isOpen={isManageOpen}
                        history={getHistoryForPosition(selectedPosition.id)!}
                        appointment={getActiveAppointment(selectedPosition.id)!}
                        onClose={() => {
                            setIsManageOpen(false);
                            setSelectedPosition(null);
                        }}
                    />
                )}
            </div>
        </AppLayout>
    );
}
