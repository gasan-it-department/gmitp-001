import { 
    LockKeyhole, 
    Info 
} from 'lucide-react';
import { Head } from '@inertiajs/react';

export default function MunicipalityNoAccess() {
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <Head title="Access Paused" />
            
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            {/* Decorative Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg px-4">
                <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
                    
                    {/* Header Strip */}
                    <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

                    <div className="p-8 md:p-12 flex flex-col items-center text-center">
                        
                        {/* Icon Badge */}
                        <div className="mb-6 relative">
                            <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center ring-8 ring-orange-50/50">
                                <LockKeyhole className="h-10 w-10 text-orange-500" />
                            </div>
                            <div className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                                <Info className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>

                        {/* Headlines */}
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
                            Access Temporarily Paused
                        </h1>
                        
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
                            The portal for this municipality is currently unavailable. This is likely due to a pending subscription renewal or an administrative requirement.
                        </p>

                        {/* Info Box */}
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                <span>Status Code</span>
                                <span>Action</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-sm text-slate-700 font-medium">SUBSCRIPTION-HOLD</span>
                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                                    Review Required
                                </span>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <p className="mt-6 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                            Please contact your system administrator or service provider for further assistance regarding this status.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}