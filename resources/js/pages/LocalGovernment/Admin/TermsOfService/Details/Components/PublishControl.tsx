import ToggleTermPublishController from '@/actions/App/External/Api/Controllers/Government/Terms/ToggleTermPublishController';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { router } from '@inertiajs/react';
import { Globe, Lock } from 'lucide-react';
import { useState } from 'react';
// Assuming you have a generic Modal/Dialog component

export default function PublishControl({ term }: { term: Term }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentMunicipality } = useMunicipality();

    const handleToggle = () => {
        setLoading(true);

        router.patch(
            ToggleTermPublishController.url(term.id),
            {},
            {
                headers: {
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
                onFinish: () => setLoading(false),
            },
        );
    };

    // Inside PublishControl.tsx, update your return statement to this:
    return (
        <>
            {/* Responsive classes added here (md:ml-6 md:border-l md:pl-6) */}
            <div className="flex items-center gap-3 pt-4 md:ml-6 md:border-l md:border-slate-200 md:pt-0 md:pl-6">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black tracking-tighter text-slate-400 uppercase">Visibility Status</span>
                    {term.is_published ? (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                            <Globe className="h-4 w-4" /> Published to Public
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                            <Lock className="h-4 w-4" /> Internal Draft
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={loading}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                        term.is_published
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
                    }`}
                >
                    {term.is_published ? 'Unpublish Roster' : 'Publish Roster'}
                </button>
            </div>

            <ClassicDialog
                title={term.is_published ? 'Unpublish Roster?' : 'Publish Roster?'}
                message={
                    term.is_published
                        ? 'Are you sure? This will hide the roster from the public website and return it to draft mode.'
                        : 'Are you sure you want to publish this roster? This will make the term and its appointed officials visible on the public-facing municipal website.'
                }
                open={isModalOpen}
                onPositiveClick={handleToggle}
                onNegativeClick={() => setIsModalOpen(false)}
            />
        </>
    );
}
