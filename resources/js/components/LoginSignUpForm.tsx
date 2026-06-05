import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import ToastProvider from '@/pages/Utility/ToastShower';
import login from '@/routes/login';
import { Link } from '@inertiajs/react';
import { ArrowRight, UserPlus } from 'lucide-react'; // Added UserPlus icon
import { useState } from 'react';

export function LogInSignUpForm() {
    const { currentMunicipality } = useMunicipality();
    const [isLogInSignUpDialogVisible, setLogInSignUpDialogVisible] = useState(false);

    return (
        <div>
            {/* Added gap-3 and responsive flex directions (stack on mobile, row on larger screens) */}
            <div className="flex w-full flex-col justify-end gap-3 sm:flex-row">
                {/* Secondary Action: Login */}
                <Link
                    href={login.page.url({ municipality: currentMunicipality.slug })}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
                >
                    Login <ArrowRight size={16} />
                </Link>

                {/* Primary Action: Sign Up */}
                {/* Note: Update the href="#" to your actual registration route when you are ready */}
                <Link
                    href="#"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
                >
                    Sign Up <UserPlus size={16} />
                </Link>
            </div>

            <ToastProvider />
            {/* <LogInSignUpDialog isOpen={isLogInSignUpDialogVisible} onClose={() => setLogInSignUpDialogVisible(false)} /> */}
        </div>
    );
}
