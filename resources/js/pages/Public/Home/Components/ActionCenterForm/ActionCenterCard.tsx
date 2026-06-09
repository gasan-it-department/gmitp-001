import { Card, CardContent } from '@/components/ui/card';
import { portal } from '@/routes/actionCenter';
import login from '@/routes/login';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export default function ActionCenterUi() {
    const { auth, currentMunicipality } = usePage<SharedData>().props;

    return (
        <Card className="group flex h-full flex-col rounded-xl border border-indigo-200/80 bg-white p-6 shadow-sm shadow-indigo-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-900/10 sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-indigo-50 p-3 text-indigo-700 ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-100">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Action Center</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Get the support you need - access assistance programs for food, financial aid, burial services, and more.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        disabled
                        href={portal.url({ municipality: currentMunicipality.slug })}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
                        onClick={(e) => {
                            if (auth.user === null) {
                                e.preventDefault();
                                router.visit(login.page.url({ municipality: currentMunicipality.slug }));
                            }
                        }}
                    >
                        Open Action Center
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
