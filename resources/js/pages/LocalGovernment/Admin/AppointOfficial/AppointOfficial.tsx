// import { Head, useForm } from '@inertiajs/react';
// import { Briefcase, Building2, Calendar, CheckCircle2, ChevronRight, User } from 'lucide-react';
// import { useState } from 'react';

// // Types
// import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';

// // Layout & Components
// import AppLayout from '@/layouts/App/AppLayout';
// import { CreateOfficialDialog } from './Components/CreateOfficialDialog';
// import { SearchOfficial } from './Components/SearchOfficial';

// interface Props {
//     municipality: MunicipalityType;
//     term: { data: Term };
//     positions: Position[];
// }

// export default function AppointOfficial({ municipality, term, positions }: Props) {
//     // --- STATE MANAGEMENT ---
//     const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
//     const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//     const [prefillName, setPrefillName] = useState('');

//     // Inertia Form (The "Main Quest")
//     const { data, setData, post, processing, errors } = useForm({
//         term_id: term.data.id,
//         position_id: '',
//         official_id: '',
//         actual_start_date: term.data.statutory_start, // Default to term start
//     });

//     // --- LOGIC: Group Positions by Category ---
//     // (Assuming you have a 'category' or we infer it.
//     // For now, I'll simulate a simple grouping for the UI)
//     const executivePositions = positions.filter((p) => p.title.includes('Mayor') && !p.title.includes('Vice'));
//     const legislativePositions = positions.filter((p) => !p.title.includes('Mayor') || p.title.includes('Vice'));

//     // --- HANDLERS ---
//     const handleOfficialCreated = (newOfficial: Official) => {
//         // THE INJECTION: Automatically select the newly created person
//         setSelectedOfficial(newOfficial);
//         setData('official_id', newOfficial.id);
//     };

//     const submit = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('appointments.store'));
//     };

//     return (
//         <AppLayout>
//             <Head title="Appoint Official" />

//             <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
//                 {/* HEADER CONTEXT */}
//                 <div className="flex items-start justify-between border-b pb-6">
//                     <div>
//                         <div className="mb-1 flex items-center text-sm font-medium tracking-wide text-gray-500 uppercase">
//                             <Building2 className="mr-2 h-4 w-4" />
//                             {municipality.name}
//                         </div>
//                         <h1 className="text-3xl font-bold text-gray-900">Appoint Official</h1>
//                         <p className="mt-1 text-gray-500">
//                             Term: <span className="font-medium text-gray-800">{term.data.name}</span>
//                         </p>
//                     </div>
//                     {/* Status Badge */}
//                     <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
//                         Drafting Appointment
//                     </span>
//                 </div>

//                 <form onSubmit={submit} className="space-y-8">
//                     {/* --- STEP 1: THE TARGET (Position) --- */}
//                     <section className="relative">
//                         <div className="mb-4 flex items-center gap-4">
//                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
//                             <h2 className="text-lg font-bold text-gray-900">Select Position</h2>
//                         </div>

//                         <div className="ml-12 rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-blue-300">
//                             <label className="mb-2 block text-sm font-medium text-gray-700">Which seat are we filling?</label>
//                             <div className="relative">
//                                 <Briefcase className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
//                                 <select
//                                     className="block w-full rounded-lg border-gray-300 py-3 pr-10 pl-10 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
//                                     value={data.position_id}
//                                     onChange={(e) => setData('position_id', e.target.value)}
//                                 >
//                                     <option value="" disabled>
//                                         Select a position...
//                                     </option>

//                                     <optgroup label="Executive Branch">
//                                         {executivePositions.map((pos) => (
//                                             <option key={pos.id} value={pos.id}>
//                                                 {pos.title}
//                                             </option>
//                                         ))}
//                                     </optgroup>

//                                     <optgroup label="Legislative Branch">
//                                         {legislativePositions.map((pos) => (
//                                             <option key={pos.id} value={pos.id}>
//                                                 {pos.title}
//                                             </option>
//                                         ))}
//                                     </optgroup>
//                                 </select>
//                             </div>
//                             {errors.position_id && <p className="mt-2 text-sm text-red-600">{errors.position_id}</p>}
//                         </div>

//                         {/* Connecting Line */}
//                         <div className="absolute top-16 bottom-[-32px] left-4 -z-10 w-0.5 bg-gray-200"></div>
//                     </section>

//                     {/* --- STEP 2: THE CANDIDATE (Official) --- */}
//                     <section
//                         className={`relative transition-opacity duration-300 ${!data.position_id ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
//                     >
//                         <div className="mb-4 flex items-center gap-4">
//                             <div
//                                 className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${data.position_id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
//                             >
//                                 2
//                             </div>
//                             <h2 className="text-lg font-bold text-gray-900">Select Official</h2>
//                         </div>

//                         <div className="ml-12 rounded-xl border bg-white p-6 shadow-sm">
//                             {!selectedOfficial ? (
//                                 // STATE A: SEARCH MODE
//                                 <>
//                                     <div className="mb-4">
//                                         <p className="mb-4 text-sm text-gray-500">
//                                             Search for an existing record. If they don't exist, you can create them here.
//                                         </p>
//                                         <SearchOfficial
//                                             onSelect={(official) => {
//                                                 setSelectedOfficial(official);
//                                                 setData('official_id', official.id);
//                                             }}
//                                             onCreate={(name) => {
//                                                 setPrefillName(name);
//                                                 setIsCreateDialogOpen(true);
//                                             }}
//                                         />
//                                     </div>
//                                     {errors.official_id && <p className="mt-2 text-sm text-red-600">Please select an official.</p>}
//                                 </>
//                             ) : (
//                                 // STATE B: LOCKED MODE
//                                 <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4">
//                                     <div className="flex items-center gap-4">
//                                         <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 font-bold text-blue-700">
//                                             <User className="h-6 w-6" />
//                                         </div>
//                                         <div>
//                                             <p className="text-lg font-bold text-gray-900">
//                                                 {selectedOfficial.full_name || selectedOfficial.first_name}
//                                             </p>
//                                             <p className="flex items-center gap-1 text-sm text-blue-700">
//                                                 <CheckCircle2 className="h-3 w-3" />
//                                                 Ready to appoint
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setSelectedOfficial(null);
//                                             setData('official_id', '');
//                                         }}
//                                         className="text-sm font-medium text-gray-500 underline hover:text-red-600"
//                                     >
//                                         Change
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Connecting Line */}
//                         <div className="absolute top-16 bottom-[-32px] left-4 -z-10 w-0.5 bg-gray-200"></div>
//                     </section>

//                     {/* --- STEP 3: THE CONTRACT (Dates & Confirm) --- */}
//                     <section className={`transition-opacity duration-300 ${!data.official_id ? 'pointer-events-none opacity-50' : 'opacity-100'}`}>
//                         <div className="mb-4 flex items-center gap-4">
//                             <div
//                                 className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${data.official_id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
//                             >
//                                 3
//                             </div>
//                             <h2 className="text-lg font-bold text-gray-900">Confirm Appointment</h2>
//                         </div>

//                         <div className="ml-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
//                             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                                 <div>
//                                     <label className="mb-2 block text-sm font-medium text-gray-700">Actual Start Date</label>
//                                     <div className="relative">
//                                         <Calendar className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
//                                         <input
//                                             type="date"
//                                             className="block w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
//                                             value={data.actual_start_date}
//                                             onChange={(e) => setData('actual_start_date', e.target.value)}
//                                         />
//                                     </div>
//                                     <p className="mt-2 text-xs text-gray-500">
//                                         Usually matches the term start ({term.data.statutory_start}), but can be later.
//                                     </p>
//                                 </div>

//                                 <div className="flex items-end justify-end">
//                                     <button
//                                         type="submit"
//                                         disabled={processing}
//                                         className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none md:w-auto"
//                                     >
//                                         {processing ? 'Processing...' : 'Confirm Appointment'}
//                                         <ChevronRight className="-mr-1 ml-2 h-5 w-5" />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </section>
//                 </form>

//                 {/* THE DIALOG (Outside the form flow) */}
//                 <CreateOfficialDialog
//                     onClose={() => setIsCreateDialogOpen(false)}
//                     onSuccess={handleOfficialCreated}
//                     // Optional: You could pass prefillName here if your dialog supports it
//                 />
//             </div>
//         </AppLayout>
//     );
// }
