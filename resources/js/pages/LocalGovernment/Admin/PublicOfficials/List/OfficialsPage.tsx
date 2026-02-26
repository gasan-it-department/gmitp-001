import { Input } from '@/components/ui/input';
import { ChevronRight, Crown, Mail, Phone, Search, User, Users } from 'lucide-react';
import { useState } from 'react';

// --- TYPES ---
type OfficialsPosition = 'Mayor' | 'Vice Mayor' | 'Councilor' | 'ABC President' | 'SK Federation President';

interface Official {
    id: string;
    name: string;
    position: OfficialsPosition;
    image: string | null;
    term: string;
    email?: string;
}

// --- MOCK DATA ---
const MOCK_OFFICIALS: Official[] = [
    { id: '1', name: 'Hon. Juan Dela Cruz', position: 'Mayor', image: null, term: '2025-2028', email: 'mayor@gasan.gov.ph' },
    { id: '2', name: 'Hon. Maria Clara', position: 'Vice Mayor', image: null, term: '2025-2028' },
    { id: '3', name: 'Hon. Jose Rizal', position: 'Councilor', image: null, term: '2025-2028' },
    { id: '4', name: 'Hon. Andres Bonifacio', position: 'Councilor', image: null, term: '2025-2028' },
    { id: '5', name: 'Hon. Apolinario Mabini', position: 'Councilor', image: null, term: '2025-2028' },
    { id: '6', name: 'Hon. Emilio Aguinaldo', position: 'ABC President', image: null, term: '2025-2028' },
    { id: '7', name: 'Hon. Gregorio del Pilar', position: 'SK Federation President', image: null, term: '2025-2028' },
];

// --- SUB-COMPONENT: OFFICIAL ROW ---
const OfficialRow = ({ official }: { official: Official }) => {
    // Determine style based on position
    const isExec = ['Mayor', 'Vice Mayor'].includes(official.position);

    return (
        <div
            className={`group flex flex-col gap-4 border-b p-4 transition-all duration-200 last:border-0 sm:flex-row sm:items-center ${isExec ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'bg-white hover:bg-slate-50'} `}
        >
            {/* Image */}
            <div className="flex-shrink-0">
                <div
                    className={`relative flex items-center justify-center overflow-hidden rounded-full border shadow-sm ${isExec ? 'h-14 w-14 border-amber-200 bg-amber-100 text-amber-500' : 'h-12 w-12 border-slate-200 bg-slate-100 text-slate-400'} `}
                >
                    {official.image ? (
                        <img src={official.image} alt={official.name} className="h-full w-full object-cover" />
                    ) : (
                        <User className={isExec ? 'h-7 w-7' : 'h-6 w-6'} />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                    {isExec && <Crown className="h-3.5 w-3.5 fill-amber-600 text-amber-600" />}
                    <span className={`text-[10px] font-black tracking-widest uppercase ${isExec ? 'text-amber-700' : 'text-slate-500'}`}>
                        {official.position}
                    </span>
                </div>
                <h3 className={`truncate font-bold text-slate-900 ${isExec ? 'text-lg' : 'text-base'}`}>{official.name}</h3>
            </div>

            {/* Meta / Actions */}
            <div className="mt-2 flex items-center gap-4 border-t border-dashed border-slate-200 pt-2 sm:mt-0 sm:border-0 sm:pt-0">
                {/* Term Info (Desktop) */}
                <div className="mr-2 hidden flex-col items-end text-right md:flex">
                    <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">Term</span>
                    <span className="text-xs font-bold text-slate-700">{official.term}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="Email"
                    >
                        <Mail className="h-4 w-4" />
                    </button>
                    {isExec && (
                        <button
                            className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-green-50 hover:text-green-600"
                            title="Contact"
                        >
                            <Phone className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Arrow */}
                <div className="hidden text-slate-300 sm:block">
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function OfficialsList() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOfficials = MOCK_OFFICIALS.filter(
        (o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.position.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="relative min-h-screen bg-slate-50/50">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* --- HEADER --- */}
                <div className="mb-10 text-center sm:flex sm:items-end sm:justify-between sm:text-left">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 shadow-sm">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-[10px] font-black tracking-widest text-blue-700 uppercase">Directory</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Public Officials</h1>
                        <p className="mt-1 text-slate-500">List of serving officials for the term 2025-2028.</p>
                    </div>

                    {/* Search */}
                    <div className="relative mt-4 w-full sm:mt-0 sm:w-72">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Find official..."
                            className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- LIST CONTAINER --- */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {filteredOfficials.length > 0 ? (
                        filteredOfficials.map((official) => <OfficialRow key={official.id} official={official} />)
                    ) : (
                        // Empty State
                        <div className="py-16 text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                                <Search className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">No officials found</p>
                            <p className="text-xs text-slate-500">Try searching for a different name or position.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
