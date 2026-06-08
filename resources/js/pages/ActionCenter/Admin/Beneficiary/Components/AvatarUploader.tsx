import UploadBeneficiaryAvatarController from '@/actions/App/External/Documents/ActionCenter/UploadBeneficiaryAvatarController';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { router, usePage } from '@inertiajs/react';
import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    beneficiaryId: string;
    avatarUrl: string | null;
    fullName: string;
    /** Tailwind size classes for the circle. Default: medium (profile header). */
    sizeClass?: string;
    /** When false, renders a read-only avatar (no upload affordance). */
    editable?: boolean;
}

/**
 * Beneficiary profile photo with an admin-only upload affordance.
 *
 * The photo is captured during the interview (webcam → PC → file) and posted
 * straight to the avatar endpoint via multipart — it is NOT part of the
 * identity form, so it can be changed independently on both the profile page
 * and the edit page. Falls back to the person's initials when no photo is set.
 */
export default function AvatarUploader({ beneficiaryId, avatarUrl, fullName, sizeClass = 'h-16 w-16', editable = true }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const inputRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initials =
        fullName
            .trim()
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?';

    const handlePick = (file: File | null) => {
        if (!file) return;
        setError(null);
        router.post(
            UploadBeneficiaryAvatarController.url({ beneficiaryId }),
            { avatar: file },
            {
                forceFormData: true,
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    if (inputRef.current) inputRef.current.value = '';
                },
                onError: (errs) => setError((errs as Record<string, string | undefined>).avatar ?? 'Upload failed.'),
            },
        );
    };

    const circle = (
        <span className={`relative ${sizeClass} block shrink-0 overflow-hidden rounded-full bg-blue-50`}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-600 uppercase">
                    {initials}
                </span>
            )}
            {editable && (
                <span
                    className={`absolute inset-0 flex items-center justify-center bg-black/45 text-white transition-opacity ${
                        processing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                >
                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </span>
            )}
        </span>
    );

    if (!editable) {
        return circle;
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={processing}
                title="Upload / change photo"
                className="group rounded-full ring-offset-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed"
            >
                {circle}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
            />
            {error && <p className="max-w-[8rem] text-center text-[11px] leading-tight text-red-500">{error}</p>}
        </div>
    );
}
