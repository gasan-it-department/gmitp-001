import { useState } from 'react';
import { 
    Search, 
    User, 
    Crown, 
    Mail, 
    Phone, 
    ChevronRight,
    Users
} from 'lucide-react';
import { Input } from "@/components/ui/input";

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
        <div className={`
            group flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition-all duration-200 border-b last:border-0
            ${isExec ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'bg-white hover:bg-slate-50'}
        `}>
            {/* Image */}
            <div className="flex-shrink-0">
                <div className={`
                    relative overflow-hidden rounded-full border shadow-sm flex items-center justify-center
                    ${isExec ? 'h-14 w-14 border-amber-200 bg-amber-100 text-amber-500' : 'h-12 w-12 border-slate-200 bg-slate-100 text-slate-400'}
                `}>
                    {official.image ? (
                        <img src={official.image} alt={official.name} className="h-full w-full object-cover" />
                    ) : (
                        <User className={isExec ? 'h-7 w-7' : 'h-6 w-6'} />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    {isExec && <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isExec ? 'text-amber-700' : 'text-slate-500'}`}>
                        {official.position}
                    </span>
                </div>
                <h3 className={`font-bold text-slate-900 truncate ${isExec ? 'text-lg' : 'text-base'}`}>
                    {official.name}
                </h3>
            </div>

            {/* Meta / Actions */}
            <div className="flex items-center gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-dashed border-slate-200">
                {/* Term Info (Desktop) */}
                <div className="hidden md:flex flex-col items-end text-right mr-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Term</span>
                    <span className="text-xs font-bold text-slate-700">{official.term}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Email">
                        <Mail className="h-4 w-4" />
                    </button>
                    {isExec && (
                        <button className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600 transition-colors" title="Contact">
                            <Phone className="h-4 w-4" />
                        </button>
                    )}
                </div>
                
                {/* Arrow */}
                <div className="hidden sm:block text-slate-300">
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function OfficialsList() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOfficials = MOCK_OFFICIALS.filter(o => 
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                
                {/* --- HEADER --- */}
                <div className="mb-10 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm mb-3">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Directory</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Public Officials
                        </h1>
                        <p className="text-slate-500 mt-1">
                            List of serving officials for the term 2025-2028.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mt-4 sm:mt-0 w-full sm:w-72 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Find official..." 
                            className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- LIST CONTAINER --- */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    
                    {filteredOfficials.length > 0 ? (
                        filteredOfficials.map((official) => (
                            <OfficialRow key={official.id} official={official} />
                        ))
                    ) : (
                        // Empty State
                        <div className="py-16 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
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